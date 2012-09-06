requirejs.config({
  paths: {
	//'jquery': 'empty:'
	//'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'

    'jquery': 'src/lib/jquery-1.7.2.min'
  }
})
require(['src/main/jquery.continuousCalendar'])

