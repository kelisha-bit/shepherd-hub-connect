import React from "react";

const weeklyActivities = [
  { day: "Sunday", title: "Worship Service", time: "8:00AM - 10:30AM" },
  { day: "Wednesday", title: "Solution Hour", time: "9:00AM - 1:00PM" },
  { day: "Friday", title: "Bible Study", time: "6:30PM - 8:00PM" },
];

const ChurchWeeklyActivities: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold text-blue-900 mb-2 text-center">Church Weekly Activities</h3>
      <ul className="flex flex-col gap-2">
        {weeklyActivities.map((activity, idx) => (
          <li key={idx} className="bg-blue-50 rounded p-2 flex flex-col items-center">
            <span className="font-semibold text-blue-800">{activity.day}:</span>
            <span className="text-blue-700">{activity.title}</span>
            <span className="text-blue-600 text-sm">{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChurchWeeklyActivities;
