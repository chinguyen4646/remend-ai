import { configApp } from "@adonisjs/eslint-config";

export default configApp().map((config) => {
  return {
    ...config,
    rules: {
      ...config.rules,
      // Override AdonisJS prettier rules to match root .prettierrc
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false,
          trailingComma: "all",
          printWidth: 100,
        },
      ],
    },
  };
});
