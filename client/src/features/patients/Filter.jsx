import { RiFilterLine } from "@remixicon/react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { bloodGroup } from "@/utils/constants";

export default function Filter() {
  const [openOptions, setOpenOptions] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    bloodGroup: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedSearchParams = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        updatedSearchParams.set(key, value);
      } else {
        updatedSearchParams.delete(key);
      }
    });
    setSearchParams(updatedSearchParams);
    setOpenOptions(false);
  };

  const handleClearFilters = () => {
    setFilters({
      gender: "",
      bloodGroup: "",
    });
    const params = new URLSearchParams(searchParams);
    params.delete("gender");
    params.delete("bloodGroup");
    setSearchParams(params);
    setOpenOptions(false);
  };

  return (
    <>
      <div
        className={`dropdown dropdown-end ${
          openOptions ? "dropdown-open" : ""
        }`}
      >
        <div
          tabIndex={0}
          role="button"
          className="btn m-1 border border-gray-300"
        >
          <RiFilterLine className="text-gray-500" /> Filter
        </div>
        <div
          tabIndex={0}
          className="dropdown-content menu bg-base-100 border border-gray-300 rounded-box z-1 w-[250px] md:w-[300px] p-4 shadow-sm"
        >
          <div className="flex flex-col">
            <h1 className="text-lg font-bold mb-4">Apply filters</h1>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2 space-y-4">
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="select capitalize"
                >
                  <option value="" disabled={true}>
                    Select Gender
                  </option>
                  {["male", "female", "other"]?.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.bloodGroup}
                  onChange={(e) =>
                    handleFilterChange("bloodGroup", e.target.value)
                  }
                  className="select capitalize"
                >
                  <option value="" disabled={true}>
                    Select Blood Group
                  </option>
                  {Object.entries(bloodGroup)?.map((item, index) => (
                    <option key={index} value={item[1]}>
                      {item[0]}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="btn btn-outline border-[0.1px] border-gray-400"
                  >
                    Clear Filters
                  </button>
                  <button
                    type="submit"
                    className="btn bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
