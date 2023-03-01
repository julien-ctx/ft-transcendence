const config = {

	content: [
	  "./src/**/*.{html,js,svelte,ts}",
	  "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
	],
  
	theme: {
		colors : {
			transparent: 'transparent',
			current: 'currentColor',
			"primary" : "#43467C",
			'white': '#ffffff',
			'purple': '#3f3cbb',
			'midnight': '#121063',
			'metal': '#565584',
			'tahiti': '#3ab7bf',
			'silver': '#ecebff',
			'bubble-gum': '#ff77e9',
			'bermuda': '#78dcca',
		}
	},
	plugins: [
	  require('flowbite/plugin')
	],
	darkMode: 'class',
  };
  
  module.exports = config;
