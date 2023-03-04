const config = {

	content: [
	  "./src/**/*.{html,js,svelte,ts}",
	  "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
	],
  
	theme: {
		colors : {
			transparent: 'transparent',
			current: 'currentColor',
			"primary" : "#FCFBF4",
			"secondary" : "#dcd3bc",
			"third" : "#AB9158",
			"white" : "#F7ECDE",
			"base" : "primary",
			"dark" : "#282828"
		}
	},
	plugins: [
	  require('flowbite/plugin')
	],
	darkMode: 'class',
  };
  
  module.exports = config;
