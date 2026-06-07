import defaultConfig from "@forsakringskassan/eslint-config";
import cliConfig from "@forsakringskassan/eslint-config-cli";
import typescriptConfig from "@forsakringskassan/eslint-config-typescript";
import vueConfig from "@forsakringskassan/eslint-config-vue";

export default [
  {
    name: "Ignored files",
    ignores: [
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/public/**",
    ],
  },

  ...defaultConfig,

  cliConfig(),
  typescriptConfig(),
  vueConfig(),

  {
    name: "local/overrides",
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": "off",
      "no-warning-comments": "off",
      "vue/no-restricted-block": "off",
    },
  },
];
