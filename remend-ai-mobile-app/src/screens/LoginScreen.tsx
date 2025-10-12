import { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import { useAuthStore } from "../stores/authStore";
import BaseLayout from "../components/BaseLayout";

interface Props {
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch (err) {
      // Error handled by store!
    }
  };

  return (
    <BaseLayout keyboardAvoiding centered style={{ backgroundColor: "white" }}>
      <View className="mb-8">
        <Text variant="headlineLarge" className="font-bold mb-2">
          Welcome to Remend AI
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Sign in to continue your rehab journey
        </Text>
      </View>

      <View className="gap-4">
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
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading || !email || !password}
          className="mt-2"
        >
          <Text>Sign In</Text>
        </Button>

        <Button mode="text" onPress={onNavigateToRegister} disabled={isLoading}>
          <Text>Don't have an account? Register</Text>
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
