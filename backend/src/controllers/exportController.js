import { Parser } from "json2csv"; // for CSV
import { jsPDF } from "jspdf"; // fixed import for ESM
import xmljs from "xml-js"; // for XML
import WeatherEntry from "../models/WeatherEntry.js";

const { convert } = xmljs; // for XML

// GET /api/weather-entries
export const getAllWeatherEntries = async (req, res) => {
  try {
    const entries = await WeatherEntry.find().sort({ date: -1 }); // latest first
    res.status(200).json({ entries });
  } catch (err) {
    console.error("Failed to fetch weather entries:", err);
    res.status(500).json({ error: "Failed to fetch weather entries" });
  }
};

// POST /api/export
export const exportWeatherEntries = async (req, res) => {
  try {
    const { entryIds, format } = req.body;

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return res.status(400).json({ error: "No entries selected" });
    }

    if (!format) {
      return res.status(400).json({ error: "Export format not specified" });
    }

    // Fetch selected entries
    const entries = await WeatherEntry.find({ _id: { $in: entryIds } });

    if (!entries || entries.length === 0) {
      return res.status(404).json({ error: "Selected entries not found" });
    }

    let data;
    let contentType;
    let fileExtension;

    switch (format.toLowerCase()) {
      case "json":
        data = JSON.stringify(entries, null, 2);
        contentType = "application/json";
        fileExtension = "json";
        break;

      case "csv":
        const fields = ["_id", "location", "date", "weatherDescription", "temperature"];
        const parser = new Parser({ fields });
        data = parser.parse(entries);
        contentType = "text/csv";
        fileExtension = "csv";
        break;

      case "xml":
        const xmlOptions = { compact: true, ignoreComment: true, spaces: 4 };
        data = convert({ entries: { entry: entries.map(e => e.toObject()) } }, xmlOptions);
        contentType = "application/xml";
        fileExtension = "xml";
        break;

      case "md":
        data = entries.map(e =>
          `### ${e.location} - ${new Date(e.date).toLocaleDateString()}\n` +
          `**Weather:** ${e.weatherDescription}\n` +
          `**Temperature:** ${e.temperature}\n`
        ).join("\n---\n");
        contentType = "text/markdown";
        fileExtension = "md";
        break;

      case "pdf":
        const doc = new jsPDF();
        entries.forEach((e, i) => {
          const y = 10 + i * 30;
          doc.text(`Location: ${e.location}`, 10, y);
          doc.text(`Date: ${new Date(e.date).toLocaleDateString()}`, 10, y + 6);
          doc.text(`Weather: ${e.weatherDescription}`, 10, y + 12);
          doc.text(`Temperature: ${e.temperature}`, 10, y + 18);
        });
        data = Buffer.from(doc.output("arraybuffer"));
        contentType = "application/pdf";
        fileExtension = "pdf";
        break;

      default:
        return res.status(400).json({ error: "Unsupported export format" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename=weather_export.${fileExtension}`);
    res.send(data);

  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ error: "Failed to export entries" });
  }
};
