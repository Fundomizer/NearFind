# Stock Management Debugging Guide

## How to Test Stock Updates

### Step 1: Open Metro Bundler Console
Make sure you can see the console logs in your terminal where Metro is running.

### Step 2: Test the Flow

1. **Open a product** - You should see:
   ```
   Setting up real-time listener for product: [product-id]
   ```

2. **Reserve all stock** - After clicking "Confirm Reservation", you should see:
   ```
   Updating stock: {
     productId: "...",
     productName: "...",
     currentStock: X,
     quantity: X,
     newStock: 0,
     inStock: false
   }
   Stock updated successfully
   ```

3. **Real-time update received** - Immediately after, you should see:
   ```
   Product update received: {
     productId: "...",
     productName: "...",
     oldStock: X,
     newStock: 0,
     inStock: false
   }
   ```

4. **UI should update** - The reserve button should now say "Out of Stock" and be disabled

## If Stock Doesn't Update

### Check Console Logs

**If you DON'T see "Stock updated successfully":**
- The reservation is failing to update the database
- Check for Firebase permission errors

**If you see "Stock updated successfully" but NOT "Product update received":**
- The real-time listener is not working
- Check Firebase connection
- Try restarting the app

**If you see "Product update received" but UI doesn't change:**
- There's a React state update issue
- The component might not be re-rendering

### Quick Fix: Reload the App

1. In the Metro Bundler terminal, press `r` to reload
2. Or shake your device and select "Reload"

### Check Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: `tecno-mvp`
3. Go to Firestore Database
4. Check the `products` collection
5. Find the product you reserved
6. Verify `stockQuantity` is reduced to 0
7. Verify `inStock` is set to `false`

## Common Issues

### Issue: maxStock still shows old value
**Cause:** `maxStock` is calculated once and doesn't update
**Fix:** The code uses `product.stockQuantity` in the UI checks, which DOES update

### Issue: Reserve button still enabled
**Cause:** Button checks `product.stockQuantity === 0`
**Fix:** Make sure the product state is actually updating (check console logs)

### Issue: Product list shows old stock
**Cause:** You're still on the product details screen
**Fix:** Go back to the product list - it should show updated stock in real-time too
