import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Image, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { textStyle } from "../styles/TextStyles"

export default function LoginScreen() {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const handleLogin = () => {
        console.log("Email:", email);
        console.log("password:", password);
    }

    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.logoContainer}>
                <Image source={require("../../assets/nearfind-logo.png")} style={styles.logo}></Image>
                <Text style={textStyle.h1}>NearFind</Text>
            </View>

            <View style={styles.mainPanel}>
                <View style={styles.panelBackground} />
                <Text style={textStyle.h2}>Login page</Text>
                <View>
                    <Text style={textStyle.normalText}>Email</Text>
                    <TextInput placeholder="Enter your email" style={[styles.textInput, textStyle.normalText]} onChange={setEmail}></TextInput>
                </View>
                <Text style={textStyle.mutedText}>Forgot Password? <Text style={textStyle.linkText}>Click Here</Text></Text>
                <View>
                    <Text style={textStyle.normalText}>Password</Text>
                    <TextInput placeholder="Enter your password" style={[styles.textInput, textStyle.normalText]} onChange={setPassword}></TextInput>
                </View>
                <Text style={textStyle.linkText}>Terms and conditons</Text>
                <Button title="Login" onPress={handleLogin} />
                <Text style={textStyle.mutedText}>Don't have an account? <Text style={textStyle.linkText}>Register here</Text></Text>
            </View>
        </SafeAreaView>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#618D4C',
        gap: 50
    },
    mainPanel: {
        flex: 7,
        minWidth: 400,
        gap: 10,
        paddingHorizontal: 40,
        paddingVertical: 30
    }
})
