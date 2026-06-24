const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generateItineraryFromText = async (extractedText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return generateFallbackItinerary(extractedText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
You are a travel itinerary planner. Extract travel booking information from the following text and create a structured day-by-day itinerary.

Text: """${extractedText.slice(0, 3000)}"""

Return ONLY valid JSON with this structure:
{
  "title": "Trip title",
  "destination": "Destination city/country",
  "startDate": "Start date if found",
  "endDate": "End date if found",
  "summary": "Brief 2-3 sentence trip summary",
  "days": [
    {
      "day": 1,
      "date": "Date or Day label",
      "activities": ["Activity 1", "Activity 2"],
      "meals": ["Breakfast place", "Lunch place", "Dinner place"],
      "accommodation": "Hotel name"
    }
  ]
}

If specific details are missing, make reasonable suggestions based on the destination. Include at least 3 days.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return generateFallbackItinerary(extractedText);
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return generateFallbackItinerary(extractedText);
  }
};

function generateFallbackItinerary(text) {
  const lines = text.split('\n').filter(l => l.trim());

  const destination = guessDestination(text);
  const dates = extractDates(text);

  return {
    title: `Trip to ${destination}`,
    destination,
    startDate: dates.start,
    endDate: dates.end,
    summary: `Your trip to ${destination}. Based on your bookings, we have prepared a suggested itinerary for you.`,
    days: [
      {
        day: 1,
        date: 'Day 1',
        activities: ['Arrival and check-in', 'Explore local area', 'Welcome dinner'],
        meals: ['Breakfast at hotel', 'Lunch at local restaurant', 'Dinner at welcome venue'],
        accommodation: 'Hotel as per booking'
      },
      {
        day: 2,
        date: 'Day 2',
        activities: ['Morning sightseeing', 'Visit local attractions', 'Evening leisure walk'],
        meals: ['Breakfast at hotel', 'Lunch at downtown cafe', 'Dinner at rooftop restaurant'],
        accommodation: 'Hotel as per booking'
      },
      {
        day: 3,
        date: 'Day 3',
        activities: ['Shopping and souvenirs', 'Departure'],
        meals: ['Breakfast at hotel', 'Lunch on the go'],
        accommodation: 'Check-out'
      }
    ]
  };
}

function guessDestination(text) {
  const cities = [
    'Paris', 'London', 'New York', 'Dubai', 'Tokyo', 'Singapore',
    'Bangkok', 'Barcelona', 'Rome', 'Istanbul', 'Bali', 'Maldives',
    'Sydney', 'Amsterdam', 'Berlin', 'Mumbai', 'Delhi', 'Goa',
    'Jaipur', 'Manali', 'Shimla', 'Kerala', 'Ladakh', 'Rishikesh'
  ];

  for (const city of cities) {
    if (text.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }

  return 'Unknown Destination';
}

function extractDates(text) {
  const dateRegex = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g;
  const matches = text.match(dateRegex);

  return {
    start: matches ? matches[0] : 'Date not specified',
    end: matches && matches.length > 1 ? matches[matches.length - 1] : 'Date not specified'
  };
}
