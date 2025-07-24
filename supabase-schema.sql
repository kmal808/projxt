-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  max_projects INTEGER DEFAULT 1,
  max_crew_members INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'worker' CHECK (role IN ('admin', 'project_manager', 'crew_leader', 'worker')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  start_date DATE,
  end_date DATE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crews table
CREATE TABLE crews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crew_members table (many-to-many relationship)
CREATE TABLE crew_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_id UUID REFERENCES crews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crew_id, user_id)
);

-- Create project_crews table (many-to-many relationship)
CREATE TABLE project_crews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  crew_id UUID REFERENCES crews(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, crew_id)
);

-- Create user_invitations table
CREATE TABLE user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'project_manager', 'crew_leader', 'worker')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company" ON companies FOR SELECT USING (
  id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Admins can update their company" ON companies FOR UPDATE USING (
  id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for users
CREATE POLICY "Users can view users in their company" ON users FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can update users in their company" ON users FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their company" ON projects FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Project managers and admins can manage projects" ON projects FOR ALL USING (
  company_id IN (
    SELECT company_id FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
  )
);

-- RLS Policies for crews
CREATE POLICY "Users can view crews in their company" ON crews FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Crew leaders and admins can manage crews" ON crews FOR ALL USING (
  company_id IN (
    SELECT company_id FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'crew_leader', 'project_manager')
  )
);

-- RLS Policies for crew_members
CREATE POLICY "Users can view crew members in their company" ON crew_members FOR SELECT USING (
  crew_id IN (
    SELECT id FROM crews WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
);

-- RLS Policies for project_crews
CREATE POLICY "Users can view project crews in their company" ON project_crews FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
);

-- RLS Policies for user_invitations
CREATE POLICY "Admins can manage invitations for their company" ON user_invitations FOR ALL USING (
  company_id IN (
    SELECT company_id FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();