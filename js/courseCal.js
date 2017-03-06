//Init namespace
var APP = APP || {};

//Init variables and model
APP.courseView = {};
APP.courseView.model = {
    courses: {}
};

APP.calendarView = {};
APP.calendarView.model = {
    userCourses: {},
    daysOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    timeSlots: ["7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm"],
    offset: 7 //needed because our calendar starts at 7am, not midnight
};

/***************************************************************
* Func: init
* Desc: Set up both views and their components
****************************************************************/
APP.init = function() {

    //There's two views - course view and calendar view
    //Course view shows the user the catalog of courses available
    //and calendar view shows the user their weekly course schedule
    this.courseView.init();
    this.calendarView.init();
};

/***************************************************************
 * Func: init
 * Desc: Set up Nav link click handlers
 ****************************************************************/
APP.courseView.init = function(){

    //Setup navigation link listeners for tabs (Course view and Calendar View)
    document.getElementById("tabLinks").addEventListener("click",function(evt){
        var activeTab = document.querySelector("nav.tabLinks > div.active-tab");
        activeTab.classList.remove("active-tab");
        document.getElementById(activeTab.getAttribute("data-tab")).style.display = "none";

        var selectedTab = evt.target; //catch bubble event
        selectedTab.classList.add("active-tab");
        document.getElementById(selectedTab.getAttribute("data-tab")).style.display = "flex";

        //Depending on view, show/hide remove icons, which are only applicable to calendar view
        var icons = Array.prototype.slice.call(document.querySelectorAll("div.removeIconLite"));
        icons.forEach(function(icon){
            icon.style.display = (selectedTab.getAttribute("data-tab") == "calendarView" ? "block" : "none");
        });
    });
}

/***************************************************************
 * Func: loadData
 * Desc: Load data from external JSON file using JSONP method of
 * dynamic script loading
 ****************************************************************/
APP.courseView.loadData = function(json){

    var thisPtr = this;
    var courses = json.courses.map(function(course){
        course.enrolled = false;
        course.calendarSlots = [];
        course.dayIndex.forEach(function(dayIndex){
            for(var timeIndex = course.timeIndex[0]; timeIndex < course.timeIndex[1]; timeIndex++)
            {
                //Create these calendar slots to easily check for scheduling conflicts later.
                //These calculated IDs indicate which calendar slots a course will take up,
                //so any other course that takes up the same slots is a conflict
                course.calendarSlots.push(dayIndex + "-" + timeIndex);
            }
        });

        thisPtr.model.courses[course.id] = course;
        return thisPtr.createCourseCard(course);
    });

    this.displayCourses(courses);
};

/***************************************************************
 * Func: displayCourses
 * Desc: Goes through catalog of courses and displays course cards
 ****************************************************************/
APP.courseView.displayCourses = function(courses){

    var thisPtr = this;
    courses.forEach(function(course){

        //Before appending to main container, add click listeners to add/remove course icons
        course.querySelector("div.addIcon").addEventListener("click",function(evt){
            thisPtr.addCourse(evt);
        });

        course.querySelector("div.removeIcon").addEventListener("click",function(evt){
            thisPtr.removeCourse(evt);
        });

        //Add to container
        document.getElementById("courseView").appendChild(course);
    });
};

/***************************************************************
 * Func: addCourse
 * Desc: Called when user click's add course on course view
 ****************************************************************/
APP.courseView.addCourse = function(evt){

    //Course View configuration
    var courseIcon = evt.target;
    var courseId = courseIcon.id.split("-")[1];
    var course = this.model.courses[courseId];

    //Add to user course summary panel
    this.addToSummary(course);

    //Set models appropriately, marking the course as taken and adding to user course list
    course.enrolled = true;
    APP.calendarView.model.userCourses[courseId] = course;

    //Swap out icons, replacing add icon with remove since course is added
    courseIcon.parentElement.style.display = "none";
    document.getElementById("removeIconDiv-" + courseId).style.display = "block";

    //Check other courses for conflicts - if conflict detected, grey out the course
    this.checkSchedulingConflicts();
    APP.calendarView.addToCalendar(course);
};

/***************************************************************
 * Func: removeCourse
 * Desc: Called when user click's remove course on course view
 ****************************************************************/
APP.courseView.removeCourse = function(evt){

    var courseIcon = evt.target;
    var courseId = courseIcon.id.split("-")[1];

    this.model.courses[courseId].enrolled = false;
    delete APP.calendarView.model.userCourses[courseId];

    courseIcon.parentElement.style.display = "none";
    document.getElementById("addIconDiv-" + courseId).style.display = "block";

    this.removeFromSummary(courseId);
    this.checkSchedulingConflicts();
    APP.calendarView.removeFromCalendar(this.model.courses[courseId]);
};

/***************************************************************
 * Func: createCourseCard
 * Desc: Creates a single course card component to display course
 * info
 ****************************************************************/
APP.courseView.createCourseCard = function(course){

    //Grab the template and dynamically create entries based on the template format
    var template = document.querySelector('#courseCardTemplate');

    // Populate the src and template content with results from query
    // Using this template allows us to dynamically generate these course cards,
    // instead of generating the HTML for each one
    template.content.querySelector('div.courseCard').id = course.id;
    template.content.querySelector('div.addIcon').id = "addIconDiv-" + course.id;
    template.content.querySelector('div.removeIcon').id = "removeIconDiv-" + course.id;
    template.content.querySelector('div.addIcon > i').id = "addIcon-" + course.id;
    template.content.querySelector('div.removeIcon > i').id = "removeIcon-" + course.id;
    template.content.querySelector('div.courseName').textContent = course.name;
    template.content.querySelector('div.profName').textContent = course.author;
    template.content.querySelector('div.courseDays').textContent = course.days.join(" | ");
    template.content.querySelector('div.courseTimes').textContent = course.time.join(" - ");

    //deep copy of clone, add it to the results area.
    return document.importNode(template.content, true);
};

/***************************************************************
 * Func: createLiteCourseCard
 * Desc: Creates a light weight single course card for summary panel
 ****************************************************************/
APP.courseView.createLiteCourseCard = function(course){

    //Grab the template and dynamically create entries based on the template format
    var template = document.querySelector('#courseCardLiteTemplate');

    // Populate the src and template content with results from query
    template.content.querySelector('div.courseCardLite').id = "summary-" + course.id;
    template.content.querySelector('div.courseNameLite').textContent = course.name;
    template.content.querySelector('div.profNameLite').textContent = course.author;
    template.content.querySelector('div.courseDaysLite').textContent = course.days.join(" | ") + " ";
    template.content.querySelector('div.courseTimesLite').textContent = course.time.join(" - ");
    template.content.querySelector('div.removeIconLite').id = "removeIconLiteDiv-" + course.id;
    template.content.querySelector('div.removeIconLite > i').id = "removeIconLite-" + course.id;

    //deep copy of clone, add it to the results area.
    return document.importNode(template.content, true);
};

/***************************************************************
 * Func: checkSchedulingConflicts
 * Desc: Goes through available courses and checks for conflicts
 ****************************************************************/
APP.courseView.checkSchedulingConflicts = function(){

    var thisPtr = this;

    //Go through all the courses in the catalog
    for(var courseId in this.model.courses)
    {
        //Assume no conflict
        var conflictExists = false;

        //Go through all user's courses and see if the current course in the catalog
        //conflicts with the user's added courses. if so, block it.
        for(var userCourseId in APP.calendarView.model.userCourses)
        {
            APP.calendarView.model.userCourses[userCourseId].calendarSlots.forEach(function(slot){
                if(thisPtr.model.courses[courseId].calendarSlots.indexOf(slot) > -1 &&
                    thisPtr.model.courses[courseId].enrolled == false)
                        conflictExists = true;

            })
        }

        //If there's a conflict, block the course so the user can't select it
        if(conflictExists)
            $("#" + thisPtr.model.courses[courseId].id).block({});
        else
            $("#" + thisPtr.model.courses[courseId].id).unblock({});
    }
};

/***************************************************************
 * Func: addToSummary
 * Desc: Adds the course to user's summary view
 ****************************************************************/
APP.courseView.addToSummary = function(course){

    //Add to course summary
    if(Object.keys(APP.calendarView.model.userCourses).length == 0)
        document.getElementById("defaultMessage").style.display = "none";

    //Create a light version of course card for summary.
    //Also add event listener for mini remove icon in summary panel.
    //User will use this icon to remove courses in Calendar View (only visible in this view)
    var courseCard = this.createLiteCourseCard(course);
    courseCard.querySelector("div.removeIconLite").addEventListener("click",function(evt){
        APP.calendarView.removeCourse(evt);
    });
    document.getElementById("courseList").appendChild(courseCard);

};

/***************************************************************
 * Func: removeFromSummary
 * Desc: Removes course from user's summary view
 ****************************************************************/
APP.courseView.removeFromSummary = function(courseId){

    //Remove from course summary
    document.getElementById("courseList").removeChild(document.getElementById("summary-" + courseId));
    if(Object.keys(APP.calendarView.model.userCourses).length == 0)
        document.getElementById("defaultMessage").style.display = "block";
};

/***************************************************************
 * Func: init
 * Desc: Initializes calendar view components
 ****************************************************************/
APP.calendarView.init = function(){
    this.createCalendar();
};

/***************************************************************
 * Func: createCalendar
 * Desc: Creates the calendar widget dynamically
 ****************************************************************/
APP.calendarView.createCalendar = function() {

    var thisPtr = this;

    //Create the time slots for the day
    var div = document.createElement("div");
    document.getElementById("timeSlots").appendChild(div);
    this.model.timeSlots.forEach(function (slot) {
        var timeDiv = document.createElement("div");
        timeDiv.innerHTML = slot;
        document.getElementById("timeSlots").appendChild(timeDiv);
    });

    //Create days columns for calendar
    this.model.daysOfWeek.forEach(function (day,dayIndex) {
        var dayDiv = document.createElement("div");
        dayDiv.innerHTML = day;
        document.getElementById(day + "Col").appendChild(dayDiv);

        thisPtr.model.timeSlots.forEach(function(slot,hourIndex){
            var hourDiv = document.createElement("div");

            //Assign ID to each cell so we can identify conflicts later
            //For ex, the Monday 7am slot would get ID: 1-7 since 1 = Mon, 7 = 7am in military
            hourDiv.id = (dayIndex + 1) + "-" + (hourIndex + thisPtr.model.offset);
            document.getElementById(day + "Col").appendChild(hourDiv);
        });
    });
};

/***************************************************************
 * Func: addToCalendar
 * Desc: Adds the course's time slots to calendar
 ****************************************************************/
APP.calendarView.addToCalendar = function(course){

    //Go through each day the course is offered, and for each time index, determine the calendar
    //slot this will populate and color it in.
    //For the first time slot only, populate the name of the course (good for when it spans 2 hr blocks)
    course.dayIndex.forEach(function(dayIndex){
        for(var timeIndex = course.timeIndex[0]; timeIndex < course.timeIndex[1]; timeIndex++)
        {
            var div = document.getElementById(dayIndex + "-" + timeIndex);
            div.style.backgroundColor = "#B67AD1";

            //Only want title on first block, last block gets a bottom border to separate the next block
            if(timeIndex == course.timeIndex[0])
                div.innerHTML = course.name;
            else if(timeIndex == course.timeIndex[1] - 1)
                div.style.borderBottom = "1px solid #EAEAEA";
        }
    });
};

/***************************************************************
 * Func: removeFromCalendar
 * Desc: Removes the course's time slots from calendar
 ****************************************************************/
APP.calendarView.removeFromCalendar = function(course){

    course.calendarSlots.forEach(function(slot){
        var div = document.getElementById(slot);
        div.style.backgroundColor = "white"; //reset background color to clear slot
        div.style.borderBottom = "none";
        div.innerHTML = "";
    });
};

/***************************************************************
 * Func: removeCourse
 * Desc: Removes the course from calendar and also from user's summary
 ****************************************************************/
APP.calendarView.removeCourse = function(evt){

    //Removing course from calendar view when user clicks remove icon in summary panel
    //This will remove icon from course summary, from the calendar, and lastly
    //generate a click event as if the course was removed from Course View, so the icon
    //can go back to "Add Course" icon
    var courseId = evt.target.id.split("-")[1];
    document.getElementById("removeIcon-" + courseId).click();
};

