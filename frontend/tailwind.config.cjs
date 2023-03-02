const config = {

	content: [
	  "./src/**/*.{html,js,svelte,ts}",
	  "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
	],
  
	theme: {
		colors : {
			transparent: 'transparent',
			current: 'currentColor',
			"primary" : "#3A3C42",
			"secondary" : "#808080",
			"third" : "#EA519D",
			"white" : "#F7F8E2",
			"base" : "primary",
			"dark" : "#000"
		}
	},
	plugins: [
	  require('flowbite/plugin')
	],
	darkMode: 'class',
  };
  
  module.exports = config;
