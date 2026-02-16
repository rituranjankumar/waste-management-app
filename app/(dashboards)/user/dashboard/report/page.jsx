"use client";

import WasteTypeSelector from "@/components/user/wasteTypeSelector";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud, Camera,
  MapPin,
  FileText,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { apiConnector } from "@/lib/apiConnector";
import { useRouter } from "next/navigation";




export default function Page() {
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLocationFetched, setIsLocationFetched] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: {
      fullAddress: "",
      city: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },
  });

  const router = useRouter();
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    setFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });


  // claenup the prev preview url 
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);

    };
  }, [preview]);


  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("geo location not supported in your device")
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        console.log("LAT -> ", lat)
        console.log("LNG -> ", lng)
        console.log("gps accuracy -> ", pos.coords.accuracy)
        // fecth the address as the string 
        
      const toastId =  toast.loading("fetching location...")
        // call the bckend for the fetching address
        try {
          const response = await apiConnector("POST", "/api/location/resolve", { lat, lng })
          console.log("REPONSE FROM THE BACKEND FOR THE LOCATION ADDRESS -> ", response)
          setLocation(response);
          setIsLocationFetched(true);
          toast.dismiss(toastId)
          toast.success("Location fetched successfully")
        } catch (error) {
          toast.dismiss(toastId)
          console.log("ERROR IN THE FETCHING THE LOCATION ADDRESS ", error)
          toast.error("unable to fetch the location")
        }
      },

      (error) => {
        console.log("error in fetching the location ", error)
        toast.error("location access is required for the worker")
      }
    );


  };

  const handleSubmit = async () => {
    if (!selected || !file || !location?.lat) {
      toast.error("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();

    formData.append("wasteType", selected);
    formData.append("description", description);
    formData.append("image", file);

    // Location
    formData.append("lat", location.lat);
    formData.append("lng", location.lng);

    formData.append("fullAddress", location.address.fullAddress);
    formData.append("city", location.address.city);
    formData.append("district", location.address.district);
    formData.append("state", location.address.state);
    formData.append("country", location.address.country);
    formData.append("pincode", location.address.pincode);

    const toastId = toast.loading("Creating Report...")
    try {
      const res = await apiConnector("POST", "/api/user/reportWaste", formData);

      toast.dismiss(toastId);

    //  console.log("response from report waste", res);

      if (res?.success) {
        toast.success("Waste reported successfully");
        setSelected(null);
        setFile(null);
        setPreview(null);
        setDescription("");

        setLocation({
          lat: null,
          lng: null,
          address: {
            fullAddress: "",
            city: "",
            district: "",
            state: "",
            country: "",
            pincode: "",
          },
        });
        setSubmitting(false);
        router.push("/user/dashboard/track-tasks");
      }
    } catch (error) {
      setSubmitting(false);
      toast.dismiss(toastId);

      toast.error(error.message || "Error in reporting the waste")
      console.error("Submit error:", error);

    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900 px-3 py-4  flex justify-center">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-3xl shadow-lg border dark:border-zinc-800 px-2  sm:p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Report Waste Collection Issue
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Help us resolve the issue faster by providing accurate details.
          </p>
        </div>

        {/* Waste Type */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Waste Type
          </h2>
          <WasteTypeSelector selected={selected} setSelected={setSelected} />
        </section>

        {/* Upload */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Image
          </h2>

          {!file && (
            <div
              {...getRootProps()}
              className={`group relative w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition
                ${isDragActive
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-zinc-700 hover:border-green-400"
                }`}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center text-center gap-2">
                <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-green-500 transition" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Drag & drop an image
                </p>
                <p className="text-xs text-gray-400">
                  or click to browse (JPG, PNG)
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="relative rounded-2xl overflow-hidden border dark:border-zinc-700">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-52 object-cover"
              />

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-3 hover:bg-red-400  right-3 bg-black/60  transition-colors duration-200 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur"
              >
                Remove
              </button>
            </div>
          )}

          {/* select location  and show the option to edit it*/}

          {/* waste image description  */}

          <div className="space-y-3 my-4">
            <label
              htmlFor="desc"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Waste Description
            </label>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Briefly describe the waste issue (e.g. overflow, missed pickup).
            </p>

            <textarea
              id="desc"
              rows={3}
              placeholder="Describe the waste issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="
    w-full resize-none rounded-xl border px-4 py-3 text-sm
    bg-white dark:bg-zinc-900
    border-gray-300 dark:border-zinc-700
    focus:ring-2 focus:ring-green-500
  "
            />
          </div>

          <div className="space-y-4">
            {/* Detect location box */}
            <div className="rounded-xl border border-green-500/30 flex flex-col bg-green-500/10 p-4 text-sm">
              <p className="mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                <MapPin size={16} />
                Detect your current location (approximate)
              </p>

              <button
                type="button"
                onClick={() => {
                  // console.log(location)
                  requestLocation();
                }}
                className="flex w-fit cursor-pointer    gap-2 px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                <MapPin size={16} />
                {location?.lat ? "Re-detect Location" : "Add Location"}
              </button>
            </div>

            {/* Detected Address (Read-only) */}
            {isLocationFetched && (
              <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  📍 Detected Address (Approximate)
                </p>

                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {location.address.fullAddress}
                </p>

                <p className="text-xs text-zinc-500 mt-1">
                  You can edit the address details below if needed.
                </p>
              </div>
            )}

            {/* Editable Address Form */}
            {isLocationFetched && (
              <div className="rounded-xl border p-4 space-y-4 bg-white dark:bg-zinc-950">
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Edit Address
                </h4>

                {/* Full Address */}
                <div className="space-y-1">
                  <label
                    htmlFor="fullAddress"
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Full Address
                  </label>
                  <input
                    id="fullAddress"
                    className="w-full px-3 py-2 rounded-lg border 
      bg-zinc-50 dark:bg-zinc-900
      border-zinc-300 dark:border-zinc-700
      focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="House no, street, landmark"
                    value={location.address.fullAddress}
                    onChange={(e) =>
                      setLocation({
                        ...location,
                        address: {
                          ...location.address,
                          fullAddress: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                {/* City + District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      City
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="City"
                      value={location.address.city}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      District
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="District"
                      value={location.address.district}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            district: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* State + Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      State
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="State"
                      value={location.address.state}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Pincode
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Pincode"
                      value={location.address.pincode}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            pincode: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Country
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border 
      bg-zinc-50 dark:bg-zinc-900
      border-zinc-300 dark:border-zinc-700
      focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Country"
                    value={location.address.country}
                    onChange={(e) =>
                      setLocation({
                        ...location,
                        address: {
                          ...location.address,
                          country: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

            )}
          </div>
        </section>

        {/* Placeholder Submit */}
        <button
          onClick={() => {
            handleSubmit();
          }}
          disabled={submitting || !selected || !file || !location.lat || !description}
          className="w-full mt-4 cursor-pointer bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition"
        >
          Submit Report
        </button>

        <div className="w-full max-w-xl rounded-2xl border border-green-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-700 dark:text-green-400">
            📸 Tips for Better Reports
          </h2>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 rounded-xl bg-green-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="mt-0.5 text-green-600 dark:text-green-400">📷</span>
              <span>Take clear photos showing the waste clearly</span>
            </li>

            <li className="flex items-start gap-3 rounded-xl bg-green-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="mt-0.5 text-green-600 dark:text-green-400">📍</span>
              <span>Enable location services for accurate tracking</span>
            </li>

            <li className="flex items-start gap-3 rounded-xl bg-green-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="mt-0.5 text-green-600 dark:text-green-400">📝</span>
              <span>Provide detailed descriptions</span>
            </li>


          </ul>
        </div>

      </div>



    </div>
  );
}
