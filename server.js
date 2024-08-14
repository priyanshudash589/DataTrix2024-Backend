const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const razorpay = require("./razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
require("./db");
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin:'http://localhost:5173'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//models
const DataVisualization = require("./Models/datavisual");
const DesignForge = require("./Models/designforge");
const SpeedRegex = require("./Models/speedregex");
const UIUXWorkshop = require("./Models/uiux");
const DataScienceQuiz = require("./Models/datasciencequiz");
const IdeaExplorer = require("./Models/ideaexplorer");

//<============= Idea Explorer ================>

app.post("/idea-explorer-create-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    if (!amount || !currency || !receipt) {
      throw new Error("Missing required fields: amount, currency, or receipt");
    }

    const options = {
      amount: amount, // The frontend already converts it to paise
      currency: currency,
      receipt: receipt,
      notes: notes || {},
    };

    console.log("Creating order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send(`Error creating order: ${error.message}`);
  }
});

// Route to handle payment verification
app.post("/idea-explorer-verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const {
        participantName,
        participantEmail,
        participantPhone,
        participantCollege,
        participantEvent, // This is the event title
        amount,
      } = req.body;

      // Find the event by title and update it
      const event = await IdeaExplorer.findOne({ title: participantEvent });

      if (!event) {
        return res
          .status(404)
          .json({ status: "error", message: "Event not found" });
      }

      // Add the participant to the participants array
      event.participant.push({
        name: participantName,
        email: participantEmail,
        phone: participantPhone,
        college: participantCollege,
        eventTitle: participantEvent,
        paymentAmount: amount,
        paymentStatus: "paid",
      });

      // Update the available slots
      event.availableSlots -= 1;

      // Save the updated event
      await event.save();

      res.json({
        status: "success",
        message: "Payment verified and slots updated",
      });
    } else {
      res.status(400).json({ status: "verification_failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res
      .status(500)
      .json({ status: "error", message: "Error verifying payment" });
  }
});

// Initialize Idea Explorer slots if they don't exist
const ideaExplorerSlots = async () => {
  try {
    let slot = await IdeaExplorer.findOne({ title: "Idea Explorer" });
    if (!slot) {
      slot = new IdeaExplorer({
        title: "Idea Explorer",
        totalSlots: 60,
        availableSlots: 60,
        participants: [],
      });
      await slot.save();
    }
  } catch (error) {
    console.error("Error initializing Idea Explorer slots:", error);
  }
};

ideaExplorerSlots();

// Get slots of the Idea Explorer event
app.get("/idea-explorer-slots", async (req, res) => {
  try {
    const event = await IdeaExplorer.findOne({ title: "Idea Explorer" });
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json({
      totalSlots: event.totalSlots,
      availableSlots: event.availableSlots,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//<============= Idea Explorer end ================>

//<============= workshop ================>

app.post("/workshop-create-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    if (!amount || !currency || !receipt) {
      throw new Error("Missing required fields: amount, currency, or receipt");
    }

    const options = {
      amount: amount, // The frontend already converts it to paise
      currency: currency,
      receipt: receipt,
      notes: notes || {},
    };

    console.log("Creating order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send(`Error creating order: ${error.message}`);
  }
});

// Route to handle payment verification
app.post("/woorkshop-verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const {
        participantName,
        participantEmail,
        participantPhone,
        participantCollege,
        participantEvent, // This is the event title
        amount,
      } = req.body;

      // Find the event by title and update it
      const event = await UIUXWorkshop.findOne({ title: participantEvent });

      if (!event) {
        return res
          .status(404)
          .json({ status: "error", message: "Event not found" });
      }

      // Add the participant to the participants array
      event.participant.push({
        name: participantName,
        email: participantEmail,
        phone: participantPhone,
        college: participantCollege,
        eventTitle: participantEvent,
        paymentAmount: amount,
        paymentStatus: "paid",
      });

      // Update the available slots
      event.availableSlots -= 1;

      // Save the updated event
      await event.save();

      res.json({
        status: "success",
        message: "Payment verified and slots updated",
      });
    } else {
      res.status(400).json({ status: "verification_failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res
      .status(500)
      .json({ status: "error", message: "Error verifying payment" });
  }
});

// Initialize Idea Explorer slots if they don't exist
const workshopSlots = async () => {
  try {
    let slot = await UIUXWorkshop.findOne({ title: "UI/UX Workshpp" });
    if (!slot) {
      slot = new UIUXWorkshop({
        title: "UIUX Workshop",
        totalSlots: 60,
        availableSlots: 60,
        participants: [],
      });
      await slot.save();
    }
  } catch (error) {
    console.error("Error initializing UI/UX Workshop slots:", error);
  }
};

workshopSlots();

// Get slots of the Idea Explorer event
app.get("/workshop-slots", async (req, res) => {
  try {
    const event = await UIUXWorkshop.findOne({ title: "UIUX Workshop" });
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json({
      totalSlots: event.totalSlots,
      availableSlots: event.availableSlots,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//<============= Idea Explorer end ================>

//<============= Data Science Quiz ================>

const datasciencequizSlots = async () => {
  try {
    let slot = await DataScienceQuiz.findOne();
    if (!slot) {
      slot = new DataScienceQuiz({
        totalSlots: 60,
        availableSlots: 60,
        participants: [], // Initialize participants array
      });
      await slot.save();
    }
  } catch (error) {
    console.error("Error in datasciencequizSlots:", error);
  }
};

datasciencequizSlots(); // Call this to initialize slots when the server starts

// Get slots of the event
app.get("/data-science-quiz-slots", async (req, res) => {
  try {
    const quiz = await DataScienceQuiz.findOne();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Register participant
app.post("/data-science-quiz-register", async (req, res) => {
  const { name, email, college, phoneNumber } = req.body;
  console.log("Recieved Data", req.body);
  // Validate required fields
  if (!name || !email || !college || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const slot = await DataScienceQuiz.findOne();
    console.log("slot data: ", slot);
    if (!slot) {
      return res.status(500).json({ message: "Slot data not found." });
    }

    if (slot.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots." });
    }

    // Check if the participant is already registered by email or phone number
    const existingParticipant = slot.participants.find(
      (participant) =>
        participant.email === email || participant.phoneNumber === phoneNumber
    );

    if (existingParticipant) {
      return res.status(400).json({
        message:
          "Participant already registered with this Email or Phone Number.",
      });
    }

    // Register the participant
    const newParticipant = { name, email, college, phoneNumber };
    slot.participants.push(newParticipant);

    // Decrement available slots
    slot.availableSlots -= 1;
    await slot.save();

    res.status(201).json({
      message: "Registration successful",
      participant: newParticipant,
      availableSlots: slot.availableSlots,
      totalSlots: slot.totalSlots,
    });
  } catch (error) {
    console.error("Error registering participant:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//<============= Data Science Quiz ends ================>

//<============= Data Visualization ===================>

const datavisualizationSlots = async () => {
  try {
    let slot = await DataVisualization.findOne();
    if (!slot) {
      slot = new DataVisualization({
        totalSlots: 60,
        availableSlots: 60,
        participants: [],
      });
      await slot.save();
    }
  } catch (error) {
    console.error("Error in Data VisualizationSlots:", error);
  }
};

datavisualizationSlots();

// Get slots of the event
app.get("/data-visualization-slots", async (req, res) => {
  try {
    const quiz = await DataVisualization.findOne();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Register participant
app.post("/data-visualization-register", async (req, res) => {
  const { name, email, college, phoneNumber } = req.body;
  console.log("Recieved Data", req.body);
  // Validate required fields
  if (!name || !email || !college || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const slot = await DataVisualization.findOne();
    console.log("slot data: ", slot);
    if (!slot) {
      return res.status(500).json({ message: "Slot data not found." });
    }

    if (slot.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots." });
    }

    // Check if the participant is already registered by email or phone number
    const existingParticipant = slot.participants.find(
      (participant) =>
        participant.email === email || participant.phoneNumber === phoneNumber
    );

    if (existingParticipant) {
      return res.status(400).json({
        message:
          "Participant already registered with this Email or Phone Number.",
      });
    }

    // Register the participant
    const newParticipant = { name, email, college, phoneNumber };
    slot.participants.push(newParticipant);

    // Decrement available slots
    slot.availableSlots -= 1;
    await slot.save();

    res.status(201).json({
      message: "Registration successful",
      participant: newParticipant,
      availableSlots: slot.availableSlots,
      totalSlots: slot.totalSlots,
    });
  } catch (error) {
    console.error("Error registering participant:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//<============= Data Visualization End ===================>

//<============= Speed Regex ===================>

const speedregexSlots = async () => {
  try {
    let slot = await SpeedRegex.findOne();
    if (!slot) {
      slot = new SpeedRegex({
        totalSlots: 40,
        availableSlots: 40,
        participants: [],
      });
      await slot.save();
    }
  } catch (error) {
    console.error("Error in Data VisualizationSlots:", error);
  }
};

speedregexSlots();

// Get slots of the event
app.get("/speed-regex-slots", async (req, res) => {
  try {
    const quiz = await SpeedRegex.findOne();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Register participant
app.post("/speed-regex-register", async (req, res) => {
  const { name, email, college, phoneNumber } = req.body;
  console.log("Recieved Data", req.body);
  // Validate required fields
  if (!name || !email || !college || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const slot = await SpeedRegex.findOne();
    console.log("slot data: ", slot);
    if (!slot) {
      return res.status(500).json({ message: "Slot data not found." });
    }

    if (slot.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots." });
    }

    // Check if the participant is already registered by email or phone number
    const existingParticipant = slot.participants.find(
      (participant) =>
        participant.email === email || participant.phoneNumber === phoneNumber
    );

    if (existingParticipant) {
      return res.status(400).json({
        message:
          "Participant already registered with this Email or Phone Number.",
      });
    }

    // Register the participant
    const newParticipant = { name, email, college, phoneNumber };
    slot.participants.push(newParticipant);

    // Decrement available slots
    slot.availableSlots -= 1;
    await slot.save();

    res.status(201).json({
      message: "Registration successful",
      participant: newParticipant,
      availableSlots: slot.availableSlots,
      totalSlots: slot.totalSlots,
    });
  } catch (error) {
    console.error("Error registering participant:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//<============= Speed Regex End ===================>

//<============= Design Forge ===================>

const designforgeSlots = async () => {
  try {
    let slot = await DesignForge.findOne();
    if (!slot) {
      slot = new DesignForge({
        totalSlots: 40,
        availableSlots: 40,
        participants: [],
      });
      await slot.save();
    }
  } catch (error) {
    console.error("Error in Data VisualizationSlots:", error);
  }
};

designforgeSlots();

// Get slots of the event
app.get("/speed-regex-slots", async (req, res) => {
  try {
    const quiz = await DesignForge.findOne();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Register participant
app.post("/speed-regex-register", async (req, res) => {
  const { name, email, college, phoneNumber } = req.body;
  console.log("Recieved Data", req.body);
  // Validate required fields
  if (!name || !email || !college || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const slot = await DesignForge.findOne();
    console.log("slot data: ", slot);
    if (!slot) {
      return res.status(500).json({ message: "Slot data not found." });
    }

    if (slot.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots." });
    }

    // Check if the participant is already registered by email or phone number
    const existingParticipant = slot.participants.find(
      (participant) =>
        participant.email === email || participant.phoneNumber === phoneNumber
    );

    if (existingParticipant) {
      return res.status(400).json({
        message:
          "Participant already registered with this Email or Phone Number.",
      });
    }

    // Register the participant
    const newParticipant = { name, email, college, phoneNumber };
    slot.participants.push(newParticipant);

    // Decrement available slots
    slot.availableSlots -= 1;
    await slot.save();

    res.status(201).json({
      message: "Registration successful",
      participant: newParticipant,
      availableSlots: slot.availableSlots,
      totalSlots: slot.totalSlots,
    });
  } catch (error) {
    console.error("Error registering participant:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//<============= Design Forge End ===================>

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
