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
			"dark" : "#282828",
			"light_blue" : "#8171E3",
			"light_green" : "#64D989",
			"light_yellow" : "#AED250",
		},

		fontFamily: {
			"ubuntu" : ["Ubuntu", "sans-serif"],
		},
	},
	plugins: [
	  require('flowbite/plugin')
	],
	darkMode: 'class',
  };
  module.exports = config;