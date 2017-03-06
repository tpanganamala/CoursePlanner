
 README

 Author: Tirumal Panganamala
 Date: March 3, 2017

************** Instructions ****************

1) Unzip CourseCalendar.zip and launch the courseCal.html file

   NOTE: by default, this loads the bigCatalog.json file. This can be changed in courseCal.html to read catalog.json
   if you wish. Just remember to only use one at a time, since they have overlapping IDs.

************** Core Features ***************

1) There are 2 views - Course Catalog View and Calendar View. These are represented by the Tabs at the top of the page.
   Course view offers users a list of courses to choose from the catalog. Calendar View shows them their courses in a
   weekly calendar view.
2) When a course is added, it will appear in the Course Summary panel (persisted/fixed across both views & on scroll).
   It will also be added to their calendar.
3) Adding a course will immediately trigger a scheduling conflict check to grey out courses that can no longer be
   taken. This is so the user isn't put through the inconvenience of being allowed to add a course that conflicts, only
   to get a message indicating them they cannot do that. Best to prevent them from going down that path.
4) After adding a course, the remove icon appears and allows the user to remove the course - triggering another
   scheduling conflict check to enable those courses that were previously greyed out. Removing a course will remove it
   from the Course Summary and Calendar.
5) Switching to Calendar view - the user's courses appear on calendar as blocks with the course title.
6) While on Calendar View - the Course Summary panel allows the user to remove courses from their calendar. Notice the
   mini remove icons that appear to the left of each course in the Course Summary panel.
7) Removing a course from the Course Summary panel (in Calendar View only) will remove it from the calendar, from the
   Course Summary panel, and from the course catalog, triggering the scheduling conflict checker.
8) In Calendar View, user can name/edit their calendar to the top right.

************** Design Decisions / "TODO" features ************

1) I decided to use the JSON-P approach to load the external .json file. I included a wrapper function around the
   courses in the .json files such that when loaded dynamically as a <script> it will automatically get loaded.
2) I wanted to use as much vanilla JS/HTML/CSS as possible, both to show my core skill set and to reduce the dependency
   on 3rd party libraries. Plus, coming up with CSS styling from scratch is fun :)
3) I originally allowed the user to delete directly from the calendar, where a remove icon would appear in the calendar
   cell on hover. But before deleting each course, I found myself constantly looking back at the Course Summary to see
   on what days/times it was offered, so I could see the change on my calendar on delete. This made me reconsider where
   they should delete a course from while on Calendar View, so I moved it to the Course Summary, which was a cleaner
   approach.
4) TODO: If given more time, I wanted to able implement the following features:
    - Come up to speed on Express/Node so I could use the given skeleton, instead of going with the JSON-P approach
    - Allow the user to sort on the Course/Prof name
    - Allow the user to filter courses based on the day of the week it was offered and the timing. For ex: Show me
    courses offered on Mon/Wed/Fri before noon. Or, show me late evening courses offered on Tues/Thurs after 4pm.
    - Add a Drop All courses button to clear their schedule all at once.
    - Since we're naming calendars, it would have been cool to allow the user to plan multiple calendar configurations,
    such that they can tab through their saved calendars and see which schedule they liked best.

