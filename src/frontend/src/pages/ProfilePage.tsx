import { useApp } from "@/context/AppContext";
import type { Lifestyle } from "@/data/mockUsers";
import {
  Camera,
  CheckCircle,
  Edit2,
  Heart,
  MapPin,
  Save,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

const LIFESTYLE_OPTIONS: Lifestyle[] = [
  "active",
  "homebody",
  "adventurer",
  "creative",
];

const LIFESTYLE_COLORS: Record<Lifestyle, string> = {
  active: "#00f5d4",
  homebody: "#9b5de5",
  adventurer: "#ff2d78",
  creative: "#ffd60a",
};

export function ProfilePage() {
  const { currentUser, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState(currentUser?.name ?? "");
  const [editBio, setEditBio] = useState(currentUser?.bio ?? "");
  const [editHobbies, setEditHobbies] = useState(
    (currentUser?.hobbies ?? []).join(", "),
  );
  const [editInterests, setEditInterests] = useState(
    (currentUser?.interests ?? []).join(", "),
  );
  const [editLifestyle, setEditLifestyle] = useState<Lifestyle>(
    currentUser?.lifestyle ?? "active",
  );
  const [editAge, setEditAge] = useState(String(currentUser?.age ?? 25));
  const [editLocation, setEditLocation] = useState(currentUser?.location ?? "");

  if (!currentUser) return null;

  function startEdit() {
    setEditName(currentUser?.name ?? "");
    setEditBio(currentUser?.bio ?? "");
    setEditHobbies((currentUser?.hobbies ?? []).join(", "));
    setEditInterests((currentUser?.interests ?? []).join(", "));
    setEditLifestyle(currentUser?.lifestyle ?? "active");
    setEditAge(String(currentUser?.age ?? 25));
    setEditLocation(currentUser?.location ?? "");
    setIsEditing(true);
  }

  function saveEdit() {
    updateProfile({
      name: editName.trim() || currentUser?.name,
      bio: editBio.trim(),
      hobbies: editHobbies
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      interests: editInterests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      lifestyle: editLifestyle,
      age: Number.parseInt(editAge) || currentUser?.age,
      location: editLocation.trim() || currentUser?.location,
    });
    setIsEditing(false);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateProfile({ profileImage: url });
  }

  const displayedHobbies = currentUser.hobbies;
  const displayedInterests = currentUser.interests;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div
        className="glass-panel overflow-hidden"
        style={{
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(255,45,120,0.06)",
        }}
      >
        {/* Banner */}
        <div
          style={{
            height: 120,
            background:
              "linear-gradient(135deg, rgba(255,45,120,0.3) 0%, rgba(155,93,229,0.3) 50%, rgba(0,245,212,0.2) 100%)",
          }}
        />

        {/* Avatar + edit button */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-4">
            {/* Avatar */}
            <button
              type="button"
              className="avatar-upload-ring"
              onClick={() => fileRef.current?.click()}
              aria-label="Change profile photo"
            >
              <img
                src={currentUser.profileImage ?? currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-28 h-28 rounded-full object-cover"
                style={{
                  border: "3px solid rgba(255,45,120,0.5)",
                  boxShadow: "0 0 20px rgba(255,45,120,0.25)",
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <Camera size={22} style={{ color: "white" }} />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label="Upload profile photo"
              />
            </button>

            {/* Edit / Save button */}
            {!isEditing ? (
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: "rgba(255,45,120,0.1)",
                  border: "1px solid rgba(255,45,120,0.3)",
                  color: "#ff2d78",
                }}
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(240,230,255,0.5)",
                  }}
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="neon-btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                >
                  <Save size={14} />
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Name + verified */}
          {!isEditing ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2
                  className="text-2xl font-black font-display"
                  style={{
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {currentUser.name}
                </h2>
                {currentUser.isVerified && (
                  <CheckCircle size={18} style={{ color: "#00f5d4" }} />
                )}
              </div>

              <p
                className="text-base mb-1"
                style={{ color: "rgba(240,230,255,0.6)" }}
              >
                {currentUser.age} years old
              </p>

              <div className="flex items-center gap-1 mb-4">
                <MapPin size={13} style={{ color: "rgba(240,230,255,0.4)" }} />
                <span style={{ color: "rgba(240,230,255,0.4)", fontSize: 13 }}>
                  {currentUser.location}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Heart
                    size={14}
                    fill="#ff2d78"
                    style={{ color: "#ff2d78" }}
                  />
                  <span
                    style={{ color: "rgba(240,230,255,0.6)", fontSize: 13 }}
                  >
                    {currentUser.likeCount.toLocaleString()} likes
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap
                    size={14}
                    style={{ color: LIFESTYLE_COLORS[currentUser.lifestyle] }}
                  />
                  <span
                    style={{
                      color: LIFESTYLE_COLORS[currentUser.lifestyle],
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {currentUser.lifestyle}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {currentUser.bio && (
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "rgba(240,230,255,0.7)" }}
                >
                  {currentUser.bio}
                </p>
              )}

              {/* Hobbies */}
              {displayedHobbies.length > 0 && (
                <div className="mb-4">
                  <h4
                    className="text-xs font-bold mb-2"
                    style={{
                      color: "rgba(240,230,255,0.35)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    HOBBIES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {displayedHobbies.map((h) => (
                      <span
                        key={h}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: "rgba(255,45,120,0.1)",
                          border: "1px solid rgba(255,45,120,0.25)",
                          color: "rgba(240,230,255,0.75)",
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {displayedInterests.length > 0 && (
                <div>
                  <h4
                    className="text-xs font-bold mb-2"
                    style={{
                      color: "rgba(240,230,255,0.35)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    INTERESTS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {displayedInterests.map((i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: "rgba(155,93,229,0.1)",
                          border: "1px solid rgba(155,93,229,0.25)",
                          color: "rgba(240,230,255,0.75)",
                        }}
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Edit form */
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-xs font-bold mb-1.5"
                  style={{
                    color: "rgba(240,230,255,0.4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  NAME
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="dating-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="edit-age"
                    className="block text-xs font-bold mb-1.5"
                    style={{
                      color: "rgba(240,230,255,0.4)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    AGE
                  </label>
                  <input
                    id="edit-age"
                    type="number"
                    className="dating-input"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    min={18}
                    max={99}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="edit-location"
                    className="block text-xs font-bold mb-1.5"
                    style={{
                      color: "rgba(240,230,255,0.4)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    LOCATION
                  </label>
                  <input
                    id="edit-location"
                    type="text"
                    className="dating-input"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-bio"
                  className="block text-xs font-bold mb-1.5"
                  style={{
                    color: "rgba(240,230,255,0.4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  BIO
                </label>
                <textarea
                  id="edit-bio"
                  className="dating-input resize-none"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  style={{ lineHeight: 1.6 }}
                />
              </div>

              <div>
                <p
                  className="block text-xs font-bold mb-1.5"
                  style={{
                    color: "rgba(240,230,255,0.4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  LIFESTYLE
                </p>
                <div className="flex gap-2 flex-wrap">
                  {LIFESTYLE_OPTIONS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setEditLifestyle(l)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200"
                      style={{
                        background:
                          editLifestyle === l
                            ? `${LIFESTYLE_COLORS[l]}20`
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${editLifestyle === l ? `${LIFESTYLE_COLORS[l]}60` : "rgba(255,255,255,0.1)"}`,
                        color:
                          editLifestyle === l
                            ? LIFESTYLE_COLORS[l]
                            : "rgba(240,230,255,0.4)",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-hobbies"
                  className="block text-xs font-bold mb-1.5"
                  style={{
                    color: "rgba(240,230,255,0.4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  HOBBIES (comma separated)
                </label>
                <input
                  id="edit-hobbies"
                  type="text"
                  className="dating-input"
                  value={editHobbies}
                  onChange={(e) => setEditHobbies(e.target.value)}
                  placeholder="Photography, Hiking, Cooking..."
                />
              </div>

              <div>
                <label
                  htmlFor="edit-interests"
                  className="block text-xs font-bold mb-1.5"
                  style={{
                    color: "rgba(240,230,255,0.4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  INTERESTS (comma separated)
                </label>
                <input
                  id="edit-interests"
                  type="text"
                  className="dating-input"
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  placeholder="Travel, Music, Technology..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
