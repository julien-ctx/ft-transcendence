const config = {

	content: [
	  "./src/**/*.{html,js,svelte,ts}",
	  "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
	],
  
	theme: {
		colors : {
			transparent: 'transparent',
			current: 'currentColor',
			"primary" : "#434343",
			"secondary" : "#C1EFFF",
			"third" : "#54BAB9",
			"white" : "#F7ECDE",
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
