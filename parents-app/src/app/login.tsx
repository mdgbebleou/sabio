import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../services/supabase';

function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('No user session returned from Supabase.');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch profile role:', profileError.message);
      }

      const role = profileData?.role || user.user_metadata?.role || 'Parent';

      if (role === 'Parent') {
        navigation.replace('parent-dashboard');
      } else {
        navigation.replace('parent-dashboard');
      }

    } catch (error: any) {
      console.log('Login Error:', error);
      setErrorMessage(error.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Image Container */}
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Hero Image */}
            <ImageBackground
              source={require('../assets/images/login-hero.jpg')}
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
              resizeMode="cover"
            >
              <View style={styles.heroOverlay} />
            </ImageBackground>

            <View style={styles.formContainer}>
              {/* Logo and Brand Header using icon.png */}
              <View style={styles.headerContainer}>
                <View style={styles.logoRow}>
                  <Image 
                    source={require('../assets/images/icon.png')} 
                    style={styles.brandLogoImage} 
                    resizeMode="contain" 
                  />
                  <Text style={styles.brandTitle}>SABIO</Text>
                </View>
              </View>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <View style={styles.mailIconBox}>
                    <View style={styles.mailEnvelope} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email Address"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <View style={styles.lockIconBox}>
                    <View style={styles.lockBody} />
                  </View>
                  <TextInput
                    style={styles.textInputPassword}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password Row */}
              <View style={styles.rowOptions}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => alert("Please contact your system administrator to reset your password.")}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#002b49',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  heroImage: {
    height: 220,
    width: '100%',
  },
  heroImageStyle: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  formContainer: {
    padding: 28,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#002b49',
    letterSpacing: -0.5,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  mailIconBox: {
    width: 18,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    borderRadius: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailEnvelope: {
    width: 8,
    height: 5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#94a3b8',
    transform: [{ rotate: '45deg' }],
  },
  lockIconBox: {
    width: 16,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    borderRadius: 3,
    marginRight: 10,
    position: 'relative',
  },
  lockBody: {
    position: 'absolute',
    top: -6,
    left: 3,
    width: 7,
    height: 7,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#0f172a',
  },
  textInputPassword: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeButton: {
    padding: 8,
  },
  eyeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  rowOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#002b49',
    borderColor: '#002b49',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: '#0d9488',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default LoginScreen;
