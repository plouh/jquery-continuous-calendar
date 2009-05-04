(function($) {
  $.fn.continuousCalendar = function(params) {
    var WEEK_DAYS = ["ma", "ti", "ke", "to", "pe", "la", "su"];
    var MONTHS = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu",
      "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
    var startField = this.find("input.startDate");
    var endField = this.find("input.endDate");
    var startDate = fieldDate(startField);
    var endDate = fieldDate(endField);
    var firstWeekdayOfGivenDate = (startDate || new Date()).getFirstDateOfWeek(Date.MONDAY);
    var calendarContainer = this;
    var dateCells = null;
    var dateCellDates = null;
    var moveStartDate = null;
    var mouseDownDate = null;
    var range;
    if (startDate && endDate) {
      range = new DateRange(startDate, endDate);
    } else {
      range = new NullDateRange();
    }
    var status = {
      create:false,
      move:false,
      expand:false
    };

    createCalendar(this);

    if (!params.dateFormat) {
      params.dateFormat = dateFormat.masks.constructorFormat;
    }
    this.data("mouseDown", mouseDown);
    this.data("mouseMove", mouseMove);
    this.data("mouseUp", mouseUp);

    function createCalendar(container) {
      var headerTable = $("<table>").addClass("calendarHeader").append(headerRow());
      var bodyTable = $("<table>").addClass("calendarBody").append(calendarBody(params.weeksBefore, params.weeksAfter));
      var scrollContent = $("<div>").addClass("calendarScrollContent").append(bodyTable);
      var calendar = $("<div>").addClass("continuousCalendar").append(headerTable).append(scrollContent);
      container.append(calendar);
      dateCells = calendarContainer.find('.date');
      dateCellDates = dateCells.map(function() {
        return $(this).data("date");
      });
      if (isRange()) {
        bodyTable.addClass("range");
        initRangeCalendarEvents();
      } else {
        initSingleDateCalendarEvents();
      }
    }

    function headerRow() {
      var thead = $("<thead>").append(yearCell());
      thead.append('<th class="week"></th>');
      $(WEEK_DAYS).each(function() {
        var weekDay = $('<th>').append(this.toString()).addClass("weekDay");
        thead.append(weekDay);
      });
      return thead;

      function yearCell() {
        //TODO will react on scroll and depends on top left corner date
        return $("<th>").addClass("month").append(firstWeekdayOfGivenDate.getFullYear());
      }
    }

    function calendarBody(before, after) {
      var tbody = $("<tbody>");
      for (var i = before; i >= -after; i--) {
        tbody.append(calendarRow(firstWeekdayOfGivenDate.plusDays(i * (-WEEK_DAYS.length))));
      }
      return tbody;
    }

    function calendarRow(firstDayOfWeek) {
      var tr = $("<tr>").append(monthCell(firstDayOfWeek)).append(weekCell(firstDayOfWeek));
      for (var i = 0; i < WEEK_DAYS.length; i++) {
        var date = firstDayOfWeek.plusDays(i);
        var dateCell = $("<td>").addClass("date").addClass(backgroundBy(date)).append(date.getDate());
        dateCell.data("date", date);
        if (date.isToday()) dateCell.addClass("today");
        if (isRange()) {
          dateCell.toggleClass("selected", range.hasDate(date));
        } else {
          dateCell.toggleClass("selected", date.equalsOnlyDate(startDate));
        }
        tr.append(dateCell);
      }
      return tr;
    }

    function monthCell(firstDayOfWeek) {
      var th = $("<th>").addClass("month").addClass(backgroundBy(firstDayOfWeek));
      if (isRange()) {
        th.click(function() {
          range = new DateRange(firstDayOfWeek.firstDateOfMonth(), firstDayOfWeek.lastDateOfMonth());
          updateTextFields();
          selectRange();
        });
      }
      if (firstDayOfWeek.getDate() <= WEEK_DAYS.length) {
        th.append(MONTHS[firstDayOfWeek.getMonth()]);
      } else if (firstDayOfWeek.getDate() <= WEEK_DAYS.length * 2 && firstDayOfWeek.getMonth() == 0) {
        th.append(firstDayOfWeek.getFullYear());
      }
      return th;
    }

    function weekCell(firstDayOfWeek) {
      var weekNumber = $("<th>");
      weekNumber.addClass("week").addClass(backgroundBy(firstDayOfWeek)).append(firstDayOfWeek.getWeekInYear("ISO"));
      if (isRange()) {
        weekNumber.click(function () {
          range = new DateRange(firstDayOfWeek, firstDayOfWeek.plusDays(6));
          updateTextFields();
          selectRange();
        });
      }
      return weekNumber;
    }

    function backgroundBy(date) {
      return date.isOddMonth() ? ' odd' : '';
    }

    function initSingleDateCalendarEvents() {
      dateCells.click(function() {
        dateCells.removeClass("selected");
        var dateCell = $(this);
        dateCell.addClass("selected");
        startField.val(dateCell.data("date").format(params.dateFormat));
      });
    }

    function initRangeCalendarEvents() {
      dateCells.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp);
    }

    function mouseDown(e) {
      var elem = $(e.target);
      mouseDownDate = elem.data("date");
      if (range.hasDate(mouseDownDate)) {
        startMovingRange(mouseDownDate);
      } else {
        startCreatingRange(elem);
      }
      e.preventDefault();
    }

    function mouseMove(e) {
      var date = $(e.target).data("date");
      if (status.move) {
        moveRange(date);
      } else if (status.create) {
        range = new DateRange(mouseDownDate, date);
        selectRange();
      }
    }

    function mouseUp(e) {
      if (status.move) {
        updateTextFields();
        status.move = false;
      } else if (status.create) {
        range = new DateRange(mouseDownDate, $(e.target).data("date"));
        status.create = false;
        updateTextFields();
      }
    }

    function startMovingRange(date) {
      status.move = true;
      moveStartDate = date;
    }

    function moveRange(date) {
      var deltaDays = moveStartDate.distanceInDays(date);
      moveStartDate = date;
      range.shiftDays(deltaDays);
      selectRange();
    }

    function startCreatingRange(elem) {
      status.create = true;
      range = new DateRange(mouseDownDate, mouseDownDate);
      dateCells.removeClass("selected");
      elem.addClass("selected");
    }

    function selectRange() {
      selectRangeBetweenDates(range.start, range.end);
    }

    function selectRangeBetweenDates(start, end) {
      dateCells.each(function(i, elem) {
        $(elem).toggleClass("selected", dateCellDates[i].isBetweenDates(start, end));
      });
    }

    function updateTextFields() {
      startField.val(range.start.format(params.dateFormat));
      endField.val(range.end.format(params.dateFormat));
    }

    function isRange() {
      return endField && endField.length > 0;
    }

    function fieldDate(field) {
      if (field.size() > 0 && field.val().length > 0)
        return new Date(field.val());
      else
        return null;
    }

    function NullDateRange() {
      this.start = null;
      this.end = null;
      this.days = function() {
        return 0;
      };
      this.shiftDays = function() {
      };
      this.hasDate = function() {
        return false;
      };
    }

    function DateRange(date1, date2) {
      if (!date1 || !date2) {
        throw("two dates must be specified, date1=" + date1 + ", date2=" + date2);
      }
      this.start = date1.compareTo(date2) > 0 ? date2 : date1;
      this.end = date1.compareTo(date2) > 0 ? date1 : date2;
      this.days = function() {
        this.start.distanceInDays(this.end);
      };
      this.shiftDays = function(days) {
        this.start = this.start.plusDays(days);
        this.end = this.end.plusDays(days);
      };
      this.hasDate = function(date) {
        return date.isBetweenDates(this.start, this.end);
      };
    }
  };
})(jQuery);
