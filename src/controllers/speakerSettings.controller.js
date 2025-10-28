class SpeakerSettingsController {
  async getSettings(req, res) {
    try {
      const caregiverId = req.user.id;
      const speakerId = parseInt(req.params.speakerId);

      const settings = await req.service.getSettings(caregiverId, speakerId);
      res.json(settings || {});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener las configuraciones" });
    }
  }

  async updateSettings(req, res) {
    try {
      const caregiverId = req.user.id;
      const speakerId = parseInt(req.params.speakerId);
      const { mlEnabled, canEditPictograms, canEditGrids } = req.body;

      const settings = await req.service.updateSettings(
        caregiverId,
        speakerId,
        {
          mlEnabled,
          canEditPictograms,
          canEditGrids,
        }
      );

      res.json(settings);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error al actualizar las configuraciones" });
    }
  }
}

export default new SpeakerSettingsController();
