import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Image, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { textStyle } from "../styles/TextStyles"
import { useNavigation } from "@react-navigation/native";
import { signIn } from "../services/authService";

/**
 * 
 * @param {function} setIsLoggedIn memory address of the "setIsLoggedIn"
 * @returns 
 */
export default function LoginScreen({ setIsLoggedIn }) {

    const navigation = useNavigation()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please ensure that you have filled all inputs");
            return;
        }

        // Validate email
        if (!email.includes("@")) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // Firebase authentication
        setLoading(true);
        const result = await signIn(email, password);
        setLoading(false);

        if (result.success) {
            // Successfully logged in
            if (setIsLoggedIn) setIsLoggedIn(true);
        } else {
            // Show error message
            Alert.alert("Login Failed", result.error);
        }
    }

    const navigateSignup = () => {
        navigation.navigate("Signup");
    }

    return (
        <SafeAreaView style={styles.mainContainer}>
            <KeyboardAwareScrollView
                style={styles.scrollView}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20}
                keyboardOpeningTime={0}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View style={styles.logoContainer}>
                    <Image source={require("../../assets/nearfind-logo.png")} style={styles.logo}></Image>
                    <Text style={[textStyle.h1, { color: '#ffffffff' }]}>NearFind</Text>
                </View>

                <View style={styles.mainPanel}>
                    <View style={styles.panelBackground} />
                    <Text style={textStyle.h2}>Login</Text>
                    <View>
                        <Text style={textStyle.normalText}>Email</Text>
                        <TextInput placeholder="Enter your email" style={[styles.textInput, textStyle.normalText]} onChangeText={setEmail} keyboardType="email-address"></TextInput>
                    </View>
                    <Text style={textStyle.mutedText}>Forgot Password? <Text style={textStyle.linkText}>Click Here</Text></Text>
                    <View>
                        <Text style={textStyle.normalText}>Password</Text>
                        <TextInput
                            placeholder="Enter your password" style={[styles.textInput, textStyle.normalText]} onChangeText={setPassword}
                            secureTextEntry={true}>
                        </TextInput>
                    </View>
                    <Text style={textStyle.linkText}>Terms and conditons</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#4CAF50" />
                    ) : (
                        <Button title="Login" onPress={handleLogin} />
                    )}
                    <Text style={textStyle.mutedText}>Don't have an account? <Text style={textStyle.linkText} onPress={navigateSignup}>Register here</Text></Text>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    panelBackground: {
        position: 'absolute',
        aspectRatio: 1,
        width: 900,             // circle width
        height: 900,            // circle height
        borderRadius: 450,      // half of width/height → circle
        backgroundColor: '#FFFFFF',
        top: -50,                // push it down so top part is exposed
        left: '50%',                   // start at middle
        transform: [{ translateX: -420 }] // move back half width
    },
    logoContainer: {
        flex: 7,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        aspectRatio: 1,
        minWidth: 50,
        maxWidth: 100,
    },
    textInput: {
        borderWidth: 1,          // thickness of border
        borderColor: '#000000ff',     // border color
        borderRadius: 25,         // rounded corners
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#618D4C',
    },
    scrollView: {
        backgroundColor: '#618D4C',
    },
    mainPanel: {
        flex: 7,
        minWidth: 400,
        gap: 10,
        paddingHorizontal: 40,
        paddingVertical: 30,
    }
})
