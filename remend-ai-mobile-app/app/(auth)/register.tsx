import { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import BaseLayout from "../../src/components/BaseLayout";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register({ email, password, fullName: fullName || undefined });
      // After successful registration, redirect to index which will check auth and route appropriately
      router.replace("/");
    } catch {
      // Error handled by store
    }
  };

  return (
    <BaseLayout keyboardAvoiding centered className="bg-white">
      <View className="mb-8">
        <Text variant="headlineLarge" className="font-bold mb-2">
          Create Account
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Join Remend AI to start your recovery
        </Text>
      </View>

      <View className="gap-4">
        <TextInput
          label="Full Name (Optional)"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          disabled={isLoading}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          disabled={isLoading}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          disabled={isLoading}
          placeholder="Minimum 8 characters"
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading || !email || !password || password.length < 8}
          className="mt-2"
        >
          <Text>Create Account</Text>
        </Button>

        <Button mode="text" onPress={() => router.push("/(auth)/login")} disabled={isLoading}>
          <Text>Already have an account? Sign In</Text>
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={4000}
        action={{
          label: "Dismiss",
          onPress: clearError,
        }}
      >
        {error}
      </Snackbar>
    </BaseLayout>
  );
}
