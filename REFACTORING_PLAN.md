# TechnoMVP Refactoring Plan

## 📋 Analysis Summary

### Unused Files (Safe to Delete)
1. ❌ **BusinessDashboardScreen.js** - Not imported anywhere, replaced by BusinessPlaceholderScreen
2. ❌ **PriceComparisonScreen.js** - Not imported anywhere, feature not implemented

### Files with Confusing Names (Should Rename)

#### 1. BusinessPlaceholderScreen.js → BusinessDashboardScreen.js
- **Current**: `BusinessPlaceholderScreen.js` (27KB)
- **Suggested**: `BusinessDashboardScreen.js`
- **Reason**: This is NOT a placeholder - it's the actual business dashboard with full functionality
- **Impact**: Update imports in `BusinessTabNavigator.js`

#### 2. SearchScreen.js → MarketScreen.js
- **Current**: `SearchScreen.js` (32KB)
- **Suggested**: `MarketScreen.js`
- **Reason**: This is the main "Market" tab, not just search - handles products, shops, filtering
- **Impact**: Update imports in `SearchStackNavigator.js`, rename `SearchHome` to `MarketHome`

#### 3. MoreScreen.js → AccountScreen.js
- **Current**: `MoreScreen.js` (9.2KB)
- **Suggested**: `AccountScreen.js` or `ProfileScreen.js`
- **Reason**: "More" is vague - this is the Account/Profile tab
- **Impact**: Update imports in `TabNavigator.js`

### Service Files (Good - Keep As Is)
✅ authService.js
✅ businessService.js
✅ favoritesService.js
✅ firestoreService.js
✅ messageService.js
✅ reservationService.js

### Navigation Files (Good Structure)
✅ BusinessTabNavigator.js
✅ ChatStackNavigator.js
✅ LoginNavigator.js
✅ SearchStackNavigator.js
✅ TabNavigator.js

---

## 🔧 Refactoring Steps

### Step 1: Delete Unused Files (2 files)
```bash
rm src/screens/BusinessDashboardScreen.js
rm src/screens/PriceComparisonScreen.js
```

### Step 2: Rename Files (3 renames)

#### 2.1 Rename BusinessPlaceholderScreen → BusinessDashboardScreen
```bash
mv src/screens/BusinessPlaceholderScreen.js src/screens/BusinessDashboardScreen.js
```
**Update imports in:**
- src/navigation/BusinessTabNavigator.js

#### 2.2 Rename SearchScreen → MarketScreen
```bash
mv src/screens/SearchScreen.js src/screens/MarketScreen.js
```
**Update imports in:**
- src/navigation/SearchStackNavigator.js (also rename to MarketStackNavigator.js)

#### 2.3 Rename MoreScreen → AccountScreen
```bash
mv src/screens/MoreScreen.js src/screens/AccountScreen.js
```
**Update imports in:**
- src/navigation/TabNavigator.js

### Step 3: Rename Navigator (1 rename)
```bash
mv src/navigation/SearchStackNavigator.js src/navigation/MarketStackNavigator.js
```
**Update imports in:**
- src/navigation/TabNavigator.js

---

## 📁 Final Directory Structure

### src/screens/ (13 files total, down from 15)
```
src/screens/
├── AccountScreen.js              (renamed from MoreScreen.js)
├── AddProductScreen.js
├── BusinessChatScreen.js
├── BusinessDashboardScreen.js    (renamed from BusinessPlaceholderScreen.js)
├── ChatScreen.js
├── HomeScreen.js
├── IndividualChatScreen.js
├── LoginScreen.js
├── MarketScreen.js               (renamed from SearchScreen.js)
├── ProductDetailsScreen.js
├── ReservationConfirmScreen.js
├── ReservationsScreen.js
└── SignupScreen.js
```

### src/navigation/ (5 files)
```
src/navigation/
├── BusinessTabNavigator.js
├── ChatStackNavigator.js
├── LoginNavigator.js
├── MarketStackNavigator.js       (renamed from SearchStackNavigator.js)
└── TabNavigator.js
```

### src/services/ (6 files - unchanged)
```
src/services/
├── authService.js
├── businessService.js
├── favoritesService.js
├── firestoreService.js
├── messageService.js
└── reservationService.js
```

---

## 📊 Impact Summary

### Files Deleted: 2
- BusinessDashboardScreen.js (old placeholder)
- PriceComparisonScreen.js (unused feature)

### Files Renamed: 4
- BusinessPlaceholderScreen.js → BusinessDashboardScreen.js
- SearchScreen.js → MarketScreen.js
- MoreScreen.js → AccountScreen.js
- SearchStackNavigator.js → MarketStackNavigator.js

### Import Updates Needed: 4
1. src/navigation/BusinessTabNavigator.js
2. src/navigation/MarketStackNavigator.js (self + update imports)
3. src/navigation/TabNavigator.js (2 imports: MarketStackNavigator, AccountScreen)

### Total Cleanup:
- **Before**: 15 screen files
- **After**: 13 screen files
- **Reduction**: 13% fewer files
- **Better naming**: 100% of files now have clear, descriptive names

---

## ⚠️ Important Notes

1. **Test After Refactoring**: Run the app and test all navigation paths
2. **Git Tracking**: Use `git mv` instead of `mv` if using git to preserve history
3. **Case Sensitivity**: Ensure file names match exactly in import statements
4. **Clear Metro Cache**: Run `npx expo start -c` after renaming to clear bundler cache

---

## 🚀 Benefits

1. **Clearer Intent**: File names now match their actual purpose
2. **Less Confusion**: No more "placeholder" or "more" ambiguity
3. **Cleaner Codebase**: Removed 2 unused files
4. **Better Maintainability**: Future developers understand structure immediately
5. **Consistency**: Screen names match tab names (Market, Account, Business)
