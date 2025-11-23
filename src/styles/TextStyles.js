import { StyleSheet } from 'react-native';

export const textStyle = StyleSheet.create({
    // Headings
    h1: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    h2: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    h3: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    h4: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    h5: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    h6: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },

    normalText: {
        fontSize: 14,
        color: '#000',
    },

    mutedText: {
        fontSize: 14,
        color: '#666',
    },

    linkText: { // Use as a style for links
        fontSize: 14,
        color: '#007bff',
        textDecorationLine: 'underline',
    },
});