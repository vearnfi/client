import "../src/styles/app.css";

// The code below is messing with the story arguments
// export const decorators = [
//   (Story, { globals }) => {
//     const themeMode =
//       globals?.backgrounds?.value == null ||
//       globals.backgrounds.value === "#F8F8F8"
//         ? "light"
//         : "dark";

//     themeMode === "light"
//       ? window.document.documentElement.classList.remove("dark")
//       : window.document.documentElement.classList.add("dark");

//     return Story;
//   },
// ];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
