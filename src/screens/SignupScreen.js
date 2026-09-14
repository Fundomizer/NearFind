import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Image, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { textStyle } from "../styles/TextStyles"
import { useNavigation } from "@react-navigation/native";
import { signUp } from "../services/authService";

export default function SignupScreen() {

    const navigation = useNavigation()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [conpassword, setConPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        // Validation
        if (!email || !password || !conpassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Validate email format
        if (!email.includes("@")) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // Check if passwords match
        if (password !== conpassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        // Check password length
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        // Firebase signup
        setLoading(true);
        const result = await signUp(email, password);
        setLoading(false);

        if (result.success) {
            Alert.alert(
                "Success",
                "Account created successfully! Please login.",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );
        } else {
            Alert.alert("Signup Failed", result.error);
        }
    }

    const navigateLogin = () => {
        navigation.navigate("Login");
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
                    <Text style={textStyle.h2}>Sign up</Text>
                    <View>
                        <Text style={textStyle.normalText}>Email</Text>
                        <TextInput
                            placeholder="Enter your email"
                            style={[styles.textInput, textStyle.normalText]}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View>
                        <Text style={textStyle.normalText}>Password</Text>
                        <TextInput
                            placeholder="Enter your password"
                            style={[styles.textInput, textStyle.normalText]}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                    </View>
                    <View>
                        <Text style={textStyle.normalText}>Confirm password</Text>
                        <TextInput
                            placeholder="Re-enter password"
                            style={[styles.textInput, textStyle.normalText]}
                            onChangeText={setConPassword}
                            secureTextEntry={true}
                        />
                    </View>
                    <Text style={textStyle.linkText}>Terms and conditons</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#4CAF50" />
                    ) : (
                        <Button title="Sign up" onPress={handleSignup} />
                    )}
                    <Text style={textStyle.mutedText}>Already have an account? <Text style={textStyle.linkText} onPress={navigateLogin}>Login here</Text></Text>
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
