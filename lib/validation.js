function formatDateForMySQL(value) {
  if (!value) {
    return "";
  }

  // Input from datetime-local usually looks like: 2026-05-10T18:30
  const cleanValue = String(value).trim();

  if (cleanValue.includes("T")) {
    const withoutT = cleanValue.replace("T", " ");

    if (withoutT.length === 16) {
      return `${withoutT}:00`;
    }

    return withoutT;
  }

  return cleanValue;
}

// Validates event data before it is saved to MySQL
export function validateEventInput(data) {
  const errors = [];

  const title = String(data.title || "").trim();
  const description = String(data.description || "").trim();
  const location = String(data.location || "").trim();
  const rawEventDate = String(data.event_date || "").trim();
  const eventDate = formatDateForMySQL(rawEventDate);
  const capacity = Number(data.capacity);

  if (title.length < 3) {
    errors.push("Title must be at least 3 characters.");
  }

  if (description.length < 10) {
    errors.push("Description must be at least 10 characters.");
  }

  if (location.length < 2) {
    errors.push("Location is required.");
  }

  if (!rawEventDate) {
    errors.push("Event date is required.");
  }

  if (rawEventDate) {
    const parsedDate = new Date(rawEventDate);

    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("Event date must be valid.");
    }

    if (parsedDate < new Date()) {
      errors.push("Event date must be in the future.");
    }
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.push("Capacity must be at least 1.");
  }

  return {
    errors,
    values: {
      title,
      description,
      location,
      event_date: eventDate,
      capacity,
    },
  };
}
