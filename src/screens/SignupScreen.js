import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Image } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { textStyle } from "../styles/TextStyles"
import { useNavigation } from "@react-navigation/native";

export default function SignupScreen() {

    const navigation = useNavigation()
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [conpassword, setConPassword] = useState()

    const handleSignup = () => {
        console.log("Email:", email);
        console.log("password:", password);
        console.log("password:", conpassword);
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
                        <TextInput placeholder="Enter your email" style={[styles.textInput, textStyle.normalText]} onChange={setEmail}></TextInput>
                    </View>
                    <View>
                        <Text style={textStyle.normalText}>Password</Text>
                        <TextInput placeholder="Enter your password" style={[styles.textInput, textStyle.normalText]} onChange={setPassword}></TextInput>
                    </View>
                    <View>
                        <Text style={textStyle.normalText}>Confirm password</Text>
                        <TextInput placeholder="Re-enter password" style={[styles.textInput, textStyle.normalText]} onChange={setConPassword}></TextInput>
                    </View>
                    <Text style={textStyle.linkText}>Terms and conditons</Text>
                    <Button title="Sign up" onPress={handleSignup} />
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
