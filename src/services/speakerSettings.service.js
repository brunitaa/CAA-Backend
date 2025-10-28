const SpeakerSettingsRepository = require("./speakerSettings.repository");

class SpeakerSettingsService {
  constructor() {
    this.repo = new SpeakerSettingsRepository();
  }

  async getSettings(caregiverId, speakerId) {
    return this.repo.getSettings(caregiverId, speakerId);
  }

  async updateSettings(caregiverId, speakerId, settings) {
    return this.repo.createOrUpdateSettings(caregiverId, speakerId, settings);
  }
}

module.exports = SpeakerSettingsService;
