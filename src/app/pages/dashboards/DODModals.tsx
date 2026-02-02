// Additional modals content for DOD Dashboard
// This file contains the modal components for wellness, inspection, counseling, appeals, recognition, and dormitory

export const WellnessModal = `
<AnimatePresence>
  {showWellnessModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Track Student Wellness
          </h2>
          <p className="text-green-100 mt-1">Monitor student mental and physical wellbeing</p>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label className="font-bold">Select Student *</Label>
            <select
              value={newWellness.student_id}
              onChange={(e) => setNewWellness({ ...newWellness, student_id: e.target.value })}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Choose a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.student_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="font-bold">Mood Rating (1-10) *</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={newWellness.mood_rating}
              onChange={(e) => setNewWellness({ ...newWellness, mood_rating: parseInt(e.target.value) })}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <Label className="font-bold">Stress Level *</Label>
            <select
              value={newWellness.stress_level}
              onChange={(e) => setNewWellness({ ...newWellness, stress_level: e.target.value })}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <Label className="font-bold">Sleep Quality *</Label>
            <select
              value={newWellness.sleep_quality}
              onChange={(e) => setNewWellness({ ...newWellness, sleep_quality: e.target.value })}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>

          <div>
            <Label className="font-bold">Social Interaction *</Label>
            <select
              value={newWellness.social_interaction}
              onChange={(e) => setNewWellness({ ...newWellness, social_interaction: e.target.value })}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="withdrawn">Withdrawn</option>
              <option value="limited">Limited</option>
              <option value="normal">Normal</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <Label className="font-bold">Notes</Label>
            <Textarea
              value={newWellness.notes}
              onChange={(e) => setNewWellness({ ...newWellness, notes: e.target.value })}
              placeholder="Additional observations..."
              rows={3}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowWellnessModal(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTrackWellness}
            disabled={processing}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Track Wellness
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
`;

export const InspectionModal = `
<AnimatePresence>
  {showInspectionModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Dormitory Inspection
          </h2>
          <p className="text-blue-100 mt-1">Record dormitory inspection results</p>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label className="font-bold">Dormitory Name *</Label>
            <Input
              value={newInspection.dormitory_name}
              onChange={(e) => setNewInspection({ ...newInspection, dormitory_name: e.target.value })}
              placeholder="e.g., Block A, Girls Dorm 1"
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label className="font-bold">Room Number *</Label>
            <Input
              value={newInspection.room_number}
              onChange={(e) => setNewInspection({ ...newInspection, room_number: e.target.value })}
              placeholder="e.g., 101, 202"
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="font-bold">Cleanliness (0-10) *</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={newInspection.cleanliness_score}
                onChange={(e) => setNewInspection({ ...newInspection, cleanliness_score: parseInt(e.target.value) })}
                className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="font-bold">Organization (0-10) *</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={newInspection.organization_score}
                onChange={(e) => setNewInspection({ ...newInspection, organization_score: parseInt(e.target.value) })}
                className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="font-bold">Discipline (0-10) *</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={newInspection.discipline_score}
                onChange={(e) => setNewInspection({ ...newInspection, discipline_score: parseInt(e.target.value) })}
                className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <Label className="font-bold">Issues Found</Label>
            <Textarea
              value={newInspection.issues_found}
              onChange={(e) => setNewInspection({ ...newInspection, issues_found: e.target.value })}
              placeholder="List any issues or violations found..."
              rows={3}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <Label className="font-bold">Recommendations</Label>
            <Textarea
              value={newInspection.recommendations}
              onChange={(e) => setNewInspection({ ...newInspection, recommendations: e.target.value })}
              placeholder="Recommendations for improvement..."
              rows={3}
              className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowInspectionModal(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateInspection}
            disabled={processing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Record Inspection
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
`;
