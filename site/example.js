requirejs.config({
  paths: {
    'jquery': '../src/lib/jquery-1.8.0.min'
  }
})
require(['../src/main/jquery.continuousCalendar', '../src/main/DateFormat', '../src/main/DateLocale'], function(_calendar, DateFormat, DateLocale) {
  $("#singleDate2, #singleDate3").continuousCalendar({weeksBefore: 60, weeksAfter: 1, isPopup: true, locale: 'EN'})
  $("#range1").continuousCalendar({firstDate: "2/15/2007", lastDate: "9/10/2009", isPopup: true, locale: 'EN'})
  $("#range2").continuousCalendar({weeksBefore: 30, weeksAfter: 30, locale: 'EN'})
  $("#timeCalendar")
    .continuousCalendar({weeksBefore: 30, lastDate: "today", selectToday: true})
    .on('calendarChange', function() {
      var container = $(this)
      var startTime = $('select[name=tripStartTime]', container).val()
      var endTime = $('select[name=tripEndTime]', container).val()
      var range = container.calendarRange()
      range = range.withTimes(startTime, endTime)
      container.find('.totalTimeOfTrip').text(DateFormat.formatRange(range, DateLocale.EN)).toggleClass('invalid', !range.isValid())
    })
    .find("select")
    .on('change', function() { $("#timeCalendar").trigger('calendarChange') })
    .each(function() {
      for(var i = 0; i < 24; i++) {
        $(this).append($("<option>").text(i + ":00")).append($("<option>").text(i + ":30"))
      }
    })
})

