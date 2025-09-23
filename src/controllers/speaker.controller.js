import { SpeakerService } from "../services/speaker.service.js";

const speakerService = new SpeakerService();

export const createSpeaker = async (req, res) => {
  try {
    const caregiverId = req.user.userId;
    const { username, gender } = req.body;
    const result = await speakerService.createSpeaker(
      { username, gender },
      caregiverId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const selectSpeaker = async (req, res) => {
  try {
    const caregiverId = req.user.userId;
    const { speakerId } = req.body;
    const result = await speakerService.selectSpeaker(caregiverId, speakerId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
