import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Square, 
  ShoppingCart,
  Save,
  Trash2,
  Plus,
  Download
} from 'lucide-react-native';

// Product types
const productTypes = [
  { id: 'windows', name: 'Windows' },
  { id: 'siding', name: 'Siding' },
  { id: 'security_doors', name: 'Security Doors' },
  { id: 'entry_doors', name: 'Entry Doors' },
  { id: 'other', name: 'Other Products' },
];

// Window series
const windowSeries = [
  { id: 'sliding', name: 'Sliding Windows' },
  { id: 'hung', name: 'Hung Windows' },
  { id: 'casement', name: 'Casement Windows' },
  { id: 'awning', name: 'Awning Windows' },
  { id: 'fixed', name: 'Fixed Windows' },
];

// Window operations
const windowOperations = [
  { id: 'XO', name: 'XO (Left Fixed, Right Sliding)' },
  { id: 'OX', name: 'OX (Left Sliding, Right Fixed)' },
  { id: 'XOX', name: 'XOX (Center Sliding)' },
  { id: 'OXO', name: 'OXO (Center Fixed)' },
  { id: 'XX', name: 'XX (Both Sides Fixed)' },
];

// Frame colors
const frameColors = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'bronze', name: 'Bronze', hex: '#614E1A' },
  { id: 'tan', name: 'Tan', hex: '#D2B48C' },
  { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
];

// Glass types
const glassTypes = [
  { id: 'clear', name: 'Clear Glass' },
  { id: 'tinted', name: 'Tinted Glass' },
  { id: 'low_e', name: 'Low-E Glass' },
  { id: 'tempered', name: 'Tempered Glass' },
  { id: 'obscure', name: 'Obscure Glass' },
];

// Hardware options
const hardwareOptions = [
  { id: 'standard', name: 'Standard Hardware' },
  { id: 'premium', name: 'Premium Hardware' },
  { id: 'security', name: 'Security Hardware' },
];

// Screen types
const screenTypes = [
  { id: 'standard', name: 'Standard Screen' },
  { id: 'pet_resistant', name: 'Pet Resistant Screen' },
  { id: 'solar', name: 'Solar Screen' },
  { id: 'none', name: 'No Screen' },
];

export default function ConfiguratorScreen() {
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState('');
  const [series, setSeries] = useState('');
  const [dimensions, setDimensions] = useState({ width: '', height: '' });
  const [operation, setOperation] = useState('');
  const [frameColor, setFrameColor] = useState('');
  const [glassType, setGlassType] = useState('');
  const [hardware, setHardware] = useState('');
  const [screenType, setScreenType] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [currentItemPrice, setCurrentItemPrice] = useState(0);
  
  const handleNext = () => {
    if (step === 1 && !productType) {
      Alert.alert('Error', 'Please select a product type');
      return;
    }
    
    if (step === 2 && !series) {
      Alert.alert('Error', 'Please select a series');
      return;
    }
    
    if (step === 3 && (!dimensions.width || !dimensions.height)) {
      Alert.alert('Error', 'Please enter both width and height');
      return;
    }
    
    if (step === 4 && !operation) {
      Alert.alert('Error', 'Please select an operation style');
      return;
    }
    
    if (step === 5 && !frameColor) {
      Alert.alert('Error', 'Please select a frame color');
      return;
    }
    
    if (step === 6 && !glassType) {
      Alert.alert('Error', 'Please select a glass type');
      return;
    }
    
    if (step === 7 && !hardware) {
      Alert.alert('Error', 'Please select hardware');
      return;
    }
    
    if (step === 8 && !screenType) {
      Alert.alert('Error', 'Please select a screen type');
      return;
    }
    
    // Calculate price when all options are selected
    if (step === 8) {
      // Simple price calculation logic
      const basePrice = 200;
      const widthFactor = parseInt(dimensions.width) * 0.5;
      const heightFactor = parseInt(dimensions.height) * 0.5;
      const seriesFactor = series === 'casement' ? 1.2 : series === 'fixed' ? 0.8 : 1;
      const glassFactor = glassType === 'low_e' ? 1.3 : glassType === 'tempered' ? 1.5 : 1;
      const hardwareFactor = hardware === 'premium' ? 1.2 : hardware === 'security' ? 1.4 : 1;
      
      const price = basePrice + widthFactor + heightFactor;
      const adjustedPrice = price * seriesFactor * glassFactor * hardwareFactor;
      
      setCurrentItemPrice(Math.round(adjustedPrice));
    }
    
    setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleAddToCart = () => {
    const newItem = {
      id: Date.now().toString(),
      productType,
      series,
      dimensions,
      operation,
      frameColor,
      glassType,
      hardware,
      screenType,
      price: currentItemPrice,
    };
    
    setCart([...cart, newItem]);
    
    // Reset for new configuration
    setStep(1);
    setProductType('');
    setSeries('');
    setDimensions({ width: '', height: '' });
    setOperation('');
    setFrameColor('');
    setGlassType('');
    setHardware('');
    setScreenType('');
    setCurrentItemPrice(0);
    
    Alert.alert('Success', 'Item added to cart');
  };
  
  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };
  
  const handleSaveQuote = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }
    
    Alert.alert('Quote Saved', 'Your quote has been saved successfully');
  };
  
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };
  
  const renderProductTypeStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Product Type</Text>
        
        <View style={styles.optionsContainer}>
          {productTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                productType === type.id && styles.selectedOptionCard
              ]}
              onPress={() => setProductType(type.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  productType === type.id && styles.selectedOptionText
                ]}
              >
                {type.name}
              </Text>
              {productType === type.id && (
                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderSeriesStep = () => {
    if (productType !== 'windows') {
      // For demo, we'll just show a message for non-window products
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select Series</Text>
          <Text style={styles.notImplementedText}>
            Series selection for {productTypes.find(t => t.id === productType)?.name} is not implemented in this demo.
          </Text>
          <TouchableOpacity
            style={styles.demoOptionCard}
            onPress={() => setSeries('demo_series')}
          >
            <Text style={styles.optionText}>Demo Series</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Window Series</Text>
        
        <View style={styles.optionsContainer}>
          {windowSeries.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                series === option.id && styles.selectedOptionCard
              ]}
              onPress={() => setSeries(option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  series === option.id && styles.selectedOptionText
                ]}
              >
                {option.name}
              </Text>
              {series === option.id && (
                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderDimensionsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Enter Dimensions</Text>
        
        <View style={styles.dimensionsContainer}>
          <View style={styles.dimensionInputContainer}>
            <Text style={styles.dimensionLabel}>Width (inches)</Text>
            <TextInput
              style={styles.dimensionInput}
              value={dimensions.width}
              onChangeText={(text) => setDimensions({ ...dimensions, width: text })}
              keyboardType="numeric"
              placeholder="Enter width"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.dimensionInputContainer}>
            <Text style={styles.dimensionLabel}>Height (inches)</Text>
            <TextInput
              style={styles.dimensionInput}
              value={dimensions.height}
              onChangeText={(text) => setDimensions({ ...dimensions, height: text })}
              keyboardType="numeric"
              placeholder="Enter height"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>
        
        <View style={styles.drawingContainer}>
          <View 
            style={[
              styles.windowDrawing,
              {
                width: dimensions.width ? Math.min(parseInt(dimensions.width), 200) : 100,
                height: dimensions.height ? Math.min(parseInt(dimensions.height), 200) : 80,
              }
            ]}
          >
            <Text style={styles.drawingText}>Window Preview</Text>
            {dimensions.width && dimensions.height && (
              <Text style={styles.dimensionsText}>
                {dimensions.width}" × {dimensions.height}"
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  const renderOperationStep = () => {
    if (productType !== 'windows' || series !== 'sliding') {
      // For demo, we'll just show a message for non-sliding windows
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select Operation</Text>
          <Text style={styles.notImplementedText}>
            Operation selection for this product type or series is not implemented in this demo.
          </Text>
          <TouchableOpacity
            style={styles.demoOptionCard}
            onPress={() => setOperation('demo_operation')}
          >
            <Text style={styles.optionText}>Standard Operation</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Operation</Text>
        
        <View style={styles.optionsContainer}>
          {windowOperations.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                operation === option.id && styles.selectedOptionCard
              ]}
              onPress={() => setOperation(option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  operation === option.id && styles.selectedOptionText
                ]}
              >
                {option.name}
              </Text>
              {operation === option.id && (
                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.drawingContainer}>
          <View style={styles.operationDrawing}>
            {operation && (
              <Text style={styles.operationText}>
                {operation} Operation
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  const renderFrameColorStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Frame Color</Text>
        
        <View style={styles.colorOptionsContainer}>
          {frameColors.map(color => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorOption,
                frameColor === color.id && styles.selectedColorOption
              ]}
              onPress={() => setFrameColor(color.id)}
            >
              <View 
                style={[
                  styles.colorSwatch, 
                  { backgroundColor: color.hex }
                ]} 
              />
              <Text
                style={[
                  styles.colorText,
                  frameColor === color.id && styles.selectedColorText
                ]}
              >
                {color.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderGlassTypeStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Glass Type</Text>
        
        <View style={styles.optionsContainer}>
          {glassTypes.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                glassType === option.id && styles.selectedOptionCard
              ]}
              onPress={() => setGlassType(option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  glassType === option.id && styles.selectedOptionText
                ]}
              >
                {option.name}
              </Text>
              {glassType === option.id && (
                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderHardwareStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Hardware</Text>
        
        <View style={styles.optionsContainer}>
          {hardwareOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                hardware === option.id && styles.selectedOptionCard
              ]}
              onPress={() => setHardware(option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  hardware === option.id && styles.selectedOptionText
                ]}
              >
                {option.name}
              </Text>
              {hardware === option.id && (
                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderScreenTypeStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Screen Type</Text>
        
        <View style={styles.optionsContainer}>
          {screenTypes.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                screenType === option.id && styles.selectedOptionCard
              ]}
              onPress={() => setScreenType(option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  screenType === option.id && styles.selectedOptionText
                ]}
              >
                {option.name}
              </Text>
              {screenType === option.id && (
                <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderSummaryStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Configuration Summary</Text>
        
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product Type:</Text>
            <Text style={styles.summaryValue}>
              {productTypes.find(t => t.id === productType)?.name}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Series:</Text>
            <Text style={styles.summaryValue}>
              {productType === 'windows' 
                ? windowSeries.find(s => s.id === series)?.name 
                : 'Demo Series'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dimensions:</Text>
            <Text style={styles.summaryValue}>
              {dimensions.width}" × {dimensions.height}"
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Operation:</Text>
            <Text style={styles.summaryValue}>
              {productType === 'windows' && series === 'sliding'
                ? windowOperations.find(o => o.id === operation)?.name
                : 'Standard Operation'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frame Color:</Text>
            <Text style={styles.summaryValue}>
              {frameColors.find(c => c.id === frameColor)?.name}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Glass Type:</Text>
            <Text style={styles.summaryValue}>
              {glassTypes.find(g => g.id === glassType)?.name}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hardware:</Text>
            <Text style={styles.summaryValue}>
              {hardwareOptions.find(h => h.id === hardware)?.name}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Screen Type:</Text>
            <Text style={styles.summaryValue}>
              {screenTypes.find(s => s.id === screenType)?.name}
            </Text>
          </View>
          
          <View style={styles.priceSummary}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.priceValue}>${currentItemPrice}</Text>
          </View>
        </Card>
        
        <Button
          title="Add to Cart"
          leftIcon={<ShoppingCart size={16} color="#FFFFFF" />}
          onPress={handleAddToCart}
          style={styles.addToCartButton}
        />
      </View>
    );
  };
  
  const renderCartStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Shopping Cart</Text>
        
        {cart.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <ShoppingCart size={40} color={Colors.textLight} />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Button
              title="Configure New Item"
              leftIcon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => setStep(1)}
              style={styles.configureButton}
            />
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartItemsContainer}>
              {cart.map(item => (
                <Card key={item.id} style={styles.cartItemCard}>
                  <View style={styles.cartItemHeader}>
                    <Text style={styles.cartItemTitle}>
                      {productTypes.find(t => t.id === item.productType)?.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemDetail}>
                      {item.dimensions.width}" × {item.dimensions.height}"
                    </Text>
                    <Text style={styles.cartItemDetail}>
                      {frameColors.find(c => c.id === item.frameColor)?.name} Frame
                    </Text>
                    <Text style={styles.cartItemDetail}>
                      {glassTypes.find(g => g.id === item.glassType)?.name}
                    </Text>
                  </View>
                  
                  <View style={styles.cartItemPrice}>
                    <Text style={styles.cartItemPriceText}>${item.price}</Text>
                  </View>
                </Card>
              ))}
            </ScrollView>
            
            <Card style={styles.cartSummaryCard}>
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Subtotal:</Text>
                <Text style={styles.cartSummaryValue}>${calculateTotal()}</Text>
              </View>
              
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Tax (8%):</Text>
                <Text style={styles.cartSummaryValue}>${Math.round(calculateTotal() * 0.08)}</Text>
              </View>
              
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryTotal}>Total:</Text>
                <Text style={styles.cartSummaryTotalValue}>
                  ${calculateTotal() + Math.round(calculateTotal() * 0.08)}
                </Text>
              </View>
            </Card>
            
            <View style={styles.cartActions}>
              <Button
                title="Configure New Item"
                variant="outline"
                leftIcon={<Plus size={16} color={Colors.primary} />}
                onPress={() => setStep(1)}
                style={styles.cartActionButton}
              />
              
              <Button
                title="Save Quote"
                leftIcon={<Save size={16} color="#FFFFFF" />}
                onPress={handleSaveQuote}
                style={styles.cartActionButton}
              />
            </View>
          </>
        )}
      </View>
    );
  };
  
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderProductTypeStep();
      case 2:
        return renderSeriesStep();
      case 3:
        return renderDimensionsStep();
      case 4:
        return renderOperationStep();
      case 5:
        return renderFrameColorStep();
      case 6:
        return renderGlassTypeStep();
      case 7:
        return renderHardwareStep();
      case 8:
        return renderScreenTypeStep();
      case 9:
        return renderSummaryStep();
      case 10:
        return renderCartStep();
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Product Configurator',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => setStep(10)}
            >
              <ShoppingCart size={20} color={Colors.primary} />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${Math.min((step / 9) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {Math.min(step, 9)} of 9
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>
      
      {step < 10 && (
        <View style={styles.navigationButtons}>
          <Button
            title="Back"
            variant="outline"
            leftIcon={<ChevronLeft size={16} color={Colors.primary} />}
            onPress={handleBack}
            style={[styles.navButton, step === 1 && styles.disabledButton]}
            disabled={step === 1}
          />
          
          <Button
            title={step === 9 ? "Review" : "Next"}
            rightIcon={<ChevronRight size={16} color="#FFFFFF" />}
            onPress={handleNext}
            style={styles.navButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOptionCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
  notImplementedText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  demoOptionCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dimensionInputContainer: {
    flex: 1,
  },
  dimensionLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  dimensionInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  drawingContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  windowDrawing: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    minHeight: 80,
  },
  drawingText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  dimensionsText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 8,
  },
  operationDrawing: {
    width: 200,
    height: 120,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  operationText: {
    fontSize: 14,
    color: Colors.primary,
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  selectedColorOption: {
    // No visual change needed for container
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedColorText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  addToCartButton: {
    marginTop: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
    marginBottom: 24,
  },
  configureButton: {
    minWidth: 200,
  },
  cartItemsContainer: {
    marginBottom: 16,
  },
  cartItemCard: {
    marginBottom: 12,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  removeItemButton: {
    padding: 4,
  },
  cartItemDetails: {
    marginBottom: 12,
  },
  cartItemDetail: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  cartItemPrice: {
    alignItems: 'flex-end',
  },
  cartItemPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cartSummaryCard: {
    marginBottom: 16,
  },
  cartSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartSummaryLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  cartSummaryValue: {
    fontSize: 14,
    color: Colors.text,
  },
  cartSummaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cartSummaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});