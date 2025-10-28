import { StyleSheet, ScrollView, Image, View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return <View><Text>Home Screen</Text></View>;
}

function () {
  return <View><Text>Profile Screen</Text></View>;
}

function () {
  return <View><Text>Profile Screen</Text></View>;
}

function () {
  return <View><Text>Profile Screen</Text></View>;
}

function () {
  return <View><Text>Profile Screen</Text></View>;
}

export default function App() {
  return (
    <ScrollView>
      {/* Header */}
      <Image
        source={require('./assets/nearfind-logo.png')} // placeholder header image
        style={styles.headerImage}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Discover Good Deals{"\n"}Around the Corner</Text>

        <View style={styles.locationBox}>
          <Text style={styles.locationText}>Your location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.cityText}>Baguio, Philippines</Text>
            <TouchableOpacity style={styles.changeBtn}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Feature Buttons */}
      <View style={styles.featureRow}>
        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#3C8D40' }]}>
          <Icon name="search-outline" size={22} color="#fff" />
          <Text style={styles.featureText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#F9A825' }]}>
          <Icon name="map-outline" size={22} color="#fff" />
          <Text style={styles.featureText}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#F5F5F5' }]}>
          <Icon name="chatbubbles-outline" size={22} color="#555" />
          <Text style={[styles.featureText, { color: '#555' }]}>AI Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Why Choose */}
      <Text style={styles.sectionTitle}>Why Choose NearFind?</Text>

      <View style={styles.card}>
        <Icon name="pricetag-outline" size={22} color="#4CAF50" />
        <View>
          <Text style={styles.cardTitle}>Best Local Prices</Text>
          <Text style={styles.cardDesc}>Compare prices and find the best deals nearby.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Icon name="leaf-outline" size={22} color="#FFB74D" />
        <View>
          <Text style={styles.cardTitle}>Reduce Food Waste</Text>
          <Text style={styles.cardDesc}>Time-limited discounts on fresh products.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Icon name="people-outline" size={22} color="#81C784" />
        <View>
          <Text style={styles.cardTitle}>Support Local</Text>
          <Text style={styles.cardDesc}>Help small businesses thrive.</Text>
        </View>
      </View>

      {/* Call to Action */}

      <Text style={styles.ctaTitle}>Ready to discover local treasures?</Text>
      <Text style={styles.ctaSubtitle}>
        Join thousands saving money and supporting their community.
      </Text>
      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Start Exploring Now</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={22} color="#4CAF50" />
          <Text style={[styles.navText, { color: '#4CAF50' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="search" size={22} color="#555" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="map" size={22} color="#555" />
          <Text style={styles.navText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="chatbubble-ellipses" size={22} color="#555" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={22} color="#555" />
          <Text style={styles.navText}>More</Text>
        </TouchableOpacity>
      </View>

      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} /> }}
          />
          <Tab.Screen
            name="Search"
            options={{ tabBarIcon: ({ color, size }) => <Icon name="person" color={color} size={size} /> }}
          />
          <Tab.Screen
            name="Map"
            options={{ tabBarIcon: ({ color, size }) => <Icon name="map" color={color} size={size} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerImage: { width: '50%', height: 200, justifyContent: 'center', alignSelf: 'center' },
  overlay: { alignItems: 'center', padding: 16, marginTop: -80 },
  logo: { width: 50, height: 50, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#fff', marginBottom: 16 },
  locationBox: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  locationText: { fontSize: 12, color: '#777' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cityText: { fontSize: 14, marginLeft: 4, flex: 1, color: '#444' },
  changeBtn: { padding: 4 },
  changeText: { color: '#4CAF50', fontSize: 13 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  featureButton: { flex: 1, marginHorizontal: 6, alignItems: 'center', padding: 12, borderRadius: 12 },
  featureText: { color: '#fff', marginTop: 4, fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginLeft: 16, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 12, marginHorizontal: 16, marginVertical: 6, borderRadius: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardDesc: { fontSize: 12, color: '#555' },
  ctaBox: { margin: 16, borderRadius: 16, padding: 20, alignItems: 'center' },
  ctaTitle: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 6 },
  ctaSubtitle: { fontSize: 13, color: '#f0f0f0', textAlign: 'center', marginBottom: 14 },
  ctaButton: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  ctaButtonText: { color: '#2E7D32', fontWeight: '600' },
  bottomNav: {
    position: 'absolute',   // 👈 Sticks it to the screen
    bottom: 0,              // 👈 Puts it at the bottom
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 5,           // shadow for Android
    shadowColor: '#000',    // shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 3,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#555', marginTop: 2 },
});
