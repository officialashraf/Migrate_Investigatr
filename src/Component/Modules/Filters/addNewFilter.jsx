import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import "./mainGlobal.css"
import { jwtDecode } from "jwt-decode";
import { useAutoFocusWithManualAutofill } from '../../../utils/autoFocus';
import { InputField } from '../../Common/InpuField/inputField';
import DropdownField from '../../Common/SelectDropDown/selectDropDown';
import { IntervalField } from '../../Common/IntervalField/intervalField';
import AppButton from '../../Common/Buttton/button';
import PropTypes from 'prop-types';

const conversionFactors = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
};

const AddNewFilter = ({ onNewFilterCreated, filterIde, onClose }) => {
  const { inputRef, isReadOnly, handleFocus } = useAutoFocusWithManualAutofill();

  const [platform, setPlatform] = useState([]);
  const [keywordLimit, setKeywordLimit] = useState(5);
  const [filterName, setFilterName] = useState('');
  const [description, setDescription] = useState('');
  const [filterId, setFilterId] = useState([]);
  const [filterDetails, setFilterDetails] = useState(null)
  const [isEditable, setIsEditable] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [initialSourcesState, setInitialSourcesState] = useState(null);
  const lastSourceRef = useRef(null);

  const [sources, setSources] = useState([
    {
      id: undefined,
      source: '',
      platform: [],
      keywords: [],
      urls: [],
      keywordInput: '',
      urlInput: '',
      intervalValue: 6,
      intervalUnit: 'hours',
    },
  ]);
  const containerRef = useRef(null);

  const dispatch = useDispatch();
  const token = Cookies.get('accessToken');
  const toastShown = useRef(false);

  useEffect(() => {
    if (lastSourceRef.current) {
      lastSourceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [sources.length]);
  useEffect(() => {
    const checkLicense = async () => {
      try {
        const res = await axios.get(`${window.runtimeConfig.VITE_APP_API_LICENSE}/api/license`)
        const { key } = res.data;
        console.log("license_registered", key)
        const decoded = jwtDecode(key);
        console.log("decodedjwt", decoded);
        setKeywordLimit(decoded.osint_filter_keyword_limit || 5);

      } catch (err) {
        console.error("License check failed:", err);
      }
    };

    checkLicense();
  }, []);

  const normalizeSourceForComparison = (source) => {
    const { keywordInput, urlInput, ...cleanSource } = source;
    return cleanSource;
  };

  const areSourcesEqual = (sources1, sources2) => {
    if (sources1.length !== sources2.length) return false;

    return sources1.every((source1, index) => {
      const source2 = sources2[index];
      if (!source2) return false;

      const clean1 = normalizeSourceForComparison(source1);
      const clean2 = normalizeSourceForComparison(source2);

      return JSON.stringify(clean1) === JSON.stringify(clean2);
    });
  };

  const resetForm = () => {
    setFilterName('');
    setDescription('');
    setSources([{
      id: undefined,
      source: '',
      platform: [],
      keywords: [],
      urls: [],
      keywordInput: '',
      urlInput: '',
      intervalValue: 6,
      intervalUnit: 'hours',
    }]);
    setFilterDetails(null);
    setIsEditable(true);
    toastShown.current = false;
    setIsChanged(false);
    setInitialFormState(null);
    setInitialSourcesState(null);
  };


  useEffect(() => {
    if (filterIde === null) {
      resetForm();
    }
  }, [filterIde]);

  useEffect(() => {
    localStorage.setItem('filterId', filterId);
  }, [filterId, dispatch]);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setLoggedInUserId(decodedToken.sub);
      console.log("decodedjwt", decodedToken);
      console.log("User ID:", decodedToken.id);
    }
  }, [token]);


  // Replace your handlePlatformChange function with this updated version:

  // Replace your handlePlatformChange function with this updated version:

  const handlePlatformChange = (sourceIndex, event) => {
    const selected = Array.from(event.target.selectedOptions, opt => opt.value);
    const currentSourceType = sources[sourceIndex].source;

    // Check for duplicate platforms only within the SAME source type
    const duplicates = [];
    sources.forEach((src, idx) => {
      if (idx !== sourceIndex && src.source === currentSourceType && src.platform) {
        selected.forEach(platform => {
          if (src.platform.includes(platform) && !duplicates.includes(platform)) {
            duplicates.push(platform);
          }
        });
      }
    });

    // If duplicates found, show warning and filter them out
    if (duplicates.length > 0) {
      const platformNames = duplicates.join(', ');
      toast.warning(
        `Platform${duplicates.length > 1 ? 's' : ''} "${platformNames}" ${duplicates.length > 1 ? 'are' : 'is'
        } already selected in another ${currentSourceType} source.`
      );

      // Filter out duplicate platforms from selection
      const validPlatforms = selected.filter(plat => !duplicates.includes(plat));

      // Update with only valid platforms
      setSources(prevSources =>
        prevSources.map((src, i) =>
          i === sourceIndex ? { ...src, platform: validPlatforms } : src
        )
      );

      return;
    }

    // Update state if no duplicates
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === sourceIndex ? { ...src, platform: selected } : src
      )
    );

    // Clear platform error for this source (matching your existing pattern)
    if (selected.length > 0) {
      setError(prevErrors => {
        if (prevErrors.sources?.[sourceIndex]?.platform) {
          const newErrors = { ...prevErrors, sources: [...(prevErrors.sources || [])] };
          newErrors.sources[sourceIndex] = { ...newErrors.sources[sourceIndex] };
          delete newErrors.sources[sourceIndex].platform;

          if (Object.keys(newErrors.sources[sourceIndex]).length === 0) {
            newErrors.sources.splice(sourceIndex, 1);
          }
          return newErrors;
        }
        return prevErrors;
      });
    }
  };

  // Also update your validateForm function to include duplicate platform check:

  const validateForm = (isSubmitting = true) => {
    const errors = {};

    if (!filterName.trim()) {
      errors.name = "Filter name is required";
    }

    const sourceErrors = [];

    // Check for duplicate platforms within SAME source type only
    const platformMapBySourceType = new Map();

    sources.forEach((source, sourceIndex) => {
      if (source.source && source.source !== 'rss feed' && source.source !== 'dark web') {
        // Create a key for each source type
        if (!platformMapBySourceType.has(source.source)) {
          platformMapBySourceType.set(source.source, new Map());
        }

        const platformMap = platformMapBySourceType.get(source.source);

        source.platform.forEach(plat => {
          if (platformMap.has(plat)) {
            const existingIndex = platformMap.get(plat);
            if (!sourceErrors[sourceIndex]) sourceErrors[sourceIndex] = {};
            if (!sourceErrors[existingIndex]) sourceErrors[existingIndex] = {};

            sourceErrors[sourceIndex].platform = `Platform "${plat}" is already used in another ${source.source} source`;
            sourceErrors[existingIndex].platform = `Platform "${plat}" is already used in another ${source.source} source`;
          } else {
            platformMap.set(plat, sourceIndex);
          }
        });
      }
    });

    sources.forEach((source, sourceIndex) => {
      // sourceErrors[sourceIndex] mein pehle se duplicate platform ki entry ho sakti hai, 
      // isliye existing object ko lenge ya naya object banayenge.
      const sourceError = sourceErrors[sourceIndex] || {};

      if (!source.source || source.source.trim() === "") {
        sourceError.source = "Source type is required";
        sourceErrors[sourceIndex] = sourceError;
        return;
      }

      if (source.source && source.source !== 'rss feed' && source.source !== 'dark web' && (!source.platform || source.platform.length === 0)) {
        sourceError.platform = "At least one platform is required";
      }

      let minValue;
      if (source.source === 'dark web') {
        minValue = source.intervalUnit === 'hours' ? 2 : 1;
      } else {
        minValue = source.intervalUnit === 'minutes' ? 15 : 1;
      }

      if (!source.intervalValue || source.intervalValue < minValue) {
        sourceError.intervalValue = `Interval value must be at least ${minValue} ${source.intervalUnit || 'unit'}`;
      }

      if (!source.intervalUnit) {
        sourceError.intervalUnit = "Interval unit is required";
      }

      if (source.source === 'rss feed' && source.urls.length === 0) {
        sourceError.urls = "At least one RSS URL is required";
      }

      if (source.source !== 'rss feed' && source.source !== 'dark web' && source.keywords.length === 0) {
        sourceError.keywords = "At least one keyword is required";
      }

      if (source.source === 'dark web' && source.keywords.length === 0) {
        sourceError.keywords = "At least one keyword is required";
      }

      if (Object.keys(sourceError).length > 0) {
        sourceErrors[sourceIndex] = sourceError;
      } else if (sourceErrors[sourceIndex]) {
        // Agar pehle error tha but ab sab theek hai (e.g., duplicate platform fix ho gaya)
        delete sourceErrors[sourceIndex];
      }
    });

    // 🚩 FIX: Ab hum 'filter' use nahi karenge takki indices maintain rahein.
    // Hum bas check karenge ki koi error object exist karta hai ya nahi.
    const hasSourceErrors = sourceErrors.some(e => e && Object.keys(e).length > 0);

    if (hasSourceErrors) {
      errors.sources = sourceErrors; // Poora array as-is use karo, taaki index match ho.
    }

    return errors;
  };
  const handleSourceChange = (index, event) => {
    const value = event.target.value;
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === index
          ? {
            ...src,
            source: value,
            platform: [],
            urls: [],
            keywords: [],
            keywordInput: '',
            urlInput: '',
            intervalValue: 6,
            intervalUnit: 'hours'
          }
          : src
      )
    );
    setError(prevErrors => {
      // Agar koi source error hai is index par...
      if (prevErrors.sources?.[index]?.source) {
        const newErrors = { ...prevErrors, sources: [...(prevErrors.sources || [])] };
        // ...toh sirf 'source' key ko delete kar dein.
        newErrors.sources[index] = { ...newErrors.sources[index] };
        delete newErrors.sources[index].source;

        // Agar is index par ab koi error nahi bacha, toh poore index object ko hata dein
        if (Object.keys(newErrors.sources[index]).length === 0) {
          newErrors.sources.splice(index, 1);
        }
        return newErrors;
      }
      return prevErrors;
    });
  };

  const handleKeywordChange = (index, value) => {
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === index ? { ...src, keywordInput: value } : src
      )
    );

    setError(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors.sources?.[index]?.keywords) {
        newErrors.sources[index] = { ...newErrors.sources[index], keywords: "" };
      }
      return newErrors;
    });
  };

  const handleKeywordKeyDown = (index, event) => {
  if (event.key === "Enter" && sources[index].keywordInput.trim()) {
    event.preventDefault();

    const input = sources[index].keywordInput.trim();
    const newKeywords = input
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    // 🔹 Calculate total after adding new ones
    const totalKeywords = sources[index].keywords.length + newKeywords.length;
const labelType =
      sources[index].source === "social media profile" ? "User ID" : "Keyword";

    // 🔹 Check keyword limit
    if (totalKeywords > keywordLimit) {
      toast.warning(`You can only add up to  ${keywordLimit} ${labelType}'s.`);
      return; // stop execution here
    }

    // 🔹 Otherwise, update state
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === index
          ? {
              ...src,
              keywords: [...src.keywords, ...newKeywords],
              keywordInput: "",
            }
          : src
      )
    );

    // 🔹 Clear error if any
    setError(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors.sources?.[index]?.keywords) {
        newErrors.sources[index] = { ...newErrors.sources[index], keywords: "" };
      }
      return newErrors;
    });
  }
};

  const handleUrlChange = (index, value) => {
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === index ? { ...src, urlInput: value } : src
      )
    );
  };

  const handleUrlKeyDown = (index, event) => {
  if (event.key === "Enter" && sources[index].urlInput.trim()) {
    event.preventDefault();

    const input = sources[index].urlInput.trim();
    const newUrls = input
      .split(",")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const totalUrls = sources[index].urls.length + newUrls.length;

    // 🔹 URL limit check (reuse same keywordLimit or separate if you want)
    if (totalUrls > keywordLimit) {
      toast.warning(`You can only add up to ${keywordLimit} URLs.`);
      return;
    }

    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === index
          ? {
              ...src,
              urls: [...src.urls, ...newUrls],
              urlInput: "",
            }
          : src
      )
    );

    setError(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors.sources?.[index]?.urls) {
        newErrors.sources[index] = { ...newErrors.sources[index], urls: "" };
      }
      return newErrors;
    });
  }
};

  const handleDeleteKeyword = (sourceIndex, keyIndex) => {
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === sourceIndex
          ? { ...src, keywords: src.keywords.filter((_, k) => k !== keyIndex) }
          : src
      )
    );
  };

  const handleDeleteUrl = (sourceIndex, urlIndex) => {
    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === sourceIndex
          ? { ...src, urls: src.urls.filter((_, k) => k !== urlIndex) }
          : src
      )
    );
  };

  const handleIntervalValueChange = (sourceIndex, value) => {
    const source = sources[sourceIndex];
    let minValue;
    if (source.source === 'dark web') {
      minValue = source.intervalUnit === 'hours' ? 2 : 1;
    } else {
      minValue = source.intervalUnit === 'minutes' ? 15 : 1;
    }
    const numericValue = Math.max(minValue, parseInt(value, 10) || minValue);

    setSources(prevSources =>
      prevSources.map((src, i) =>
        i === sourceIndex ? { ...src, intervalValue: numericValue } : src
      )
    );

    setError(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors.sources?.[sourceIndex]?.intervalValue) {
        newErrors.sources[sourceIndex] = { ...newErrors.sources[sourceIndex], intervalValue: "" };
      }
      return newErrors;
    });
  };

  const handleIntervalUnitChange = (sourceIndex, unit) => {
    setSources(prevSources =>
      prevSources.map((src, i) => {
        if (i === sourceIndex) {
          let newMinValue = src.intervalValue;
          if (unit === 'hours' && ![3, 6, 9, 12].includes(src.intervalValue)) {
            newMinValue = 6;
          }
          const adjustedValue = src.intervalValue < newMinValue ? newMinValue : src.intervalValue;
          return { ...src, intervalUnit: unit, intervalValue: adjustedValue };
        }
        return src;
      })
    );

    setError(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors.sources?.[sourceIndex]?.intervalUnit) {
        newErrors.sources[sourceIndex] = { ...newErrors.sources[sourceIndex], intervalUnit: "" };
      }
      return newErrors;
    });
  };

  useEffect(() => {
    if (filterDetails?.id) {
      console.log('useEffect triggered', filterDetails);
      setFilterName(filterDetails.name);
      setDescription(filterDetails.description);

      // Convert filter criteria to sources format
      const convertedSources = filterDetails.filter_criteria.map(criteria => {
        // Convert interval back to value + unit
        let intervalValue = 1;
        let intervalUnit;
        if (criteria.interval) {
          if (criteria.interval % 3600 === 0) {
            intervalValue = criteria.interval / 3600;
            intervalUnit = 'hours';
          } else if (criteria.interval % 60 === 0) {
            intervalValue = criteria.interval / 60;
            intervalUnit = 'minutes';
          } else {
            intervalValue = criteria.interval;
            intervalUnit = 'seconds';
          }
        } else {
          intervalValue = 1;
          intervalUnit = 'hours';
        }

        return {
          id: criteria.id,
          source: criteria.source,
          platform: criteria.platform || [],
          keywords: criteria.keywords || [],
          urls: criteria.urls || [],
          keywordInput: '',
          urlInput: '',
          intervalValue,
          intervalUnit
        };
      });

      setSources(convertedSources);

      // Check edit permissions
      const isEditable = (loggedInUserId === filterDetails.created_by);
      console.log(isEditable)
      setIsEditable(isEditable);

      setInitialFormState({
        name: filterDetails.name,
        description: filterDetails.description,
      });
      setInitialSourcesState(convertedSources);

      if (!toastShown.current) {
        if (!isEditable) {
          toast.info("You don't have permission to edit this filter");
        }
        toastShown.current = true;
      }
    }
  }, [filterDetails, loggedInUserId]);

  // Enhanced change detection
  useEffect(() => {
    if (!initialFormState || !initialSourcesState) return;

    const hasBasicChanges =
      filterName !== initialFormState.name ||
      description !== initialFormState.description;
    const hasSourceChanges = !areSourcesEqual(sources, initialSourcesState);
    setIsChanged(hasBasicChanges || hasSourceChanges);
  }, [filterName, description, sources, initialFormState, initialSourcesState]);

  const handleAddSource = () => {
    setSources(prevSources => [
      ...prevSources,
      {
        id: undefined,
        source: '',
        platform: [],
        keywords: [],
        urls: [],
        keywordInput: '',
        urlInput: '',
        intervalValue: 6,
        intervalUnit: 'hours',
      }
    ]);
  };

  const fetchFilterDetails = async () => {
    try {
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/filter/${filterIde}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFilterDetails(response.data)
      console.log("fetchflterdetails", response)
    } catch (error) {
      console.error('Platform fetch error:', error);
      toast.error('Error fetching platforms: ' + (error.response?.data?.detail || error.message));
    }
  };

  useEffect(() => {
    if (filterIde) {
      fetchFilterDetails();
    }
  }, [filterIde]);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/platforms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlatform(response.data.data || []);
    } catch (error) {
      console.error('Platform fetch error:', error);
      toast.error('Error fetching platforms: ' + (error.response?.data?.detail || error.message));
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleSaveFilter = async () => {
    if (filterDetails?.id && !isEditable) {
      toast.error("You don't have permission to edit this filter");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    let updatePayload = {};
    if (filterDetails?.id) {
      if (filterName !== initialFormState.name) updatePayload.name = filterName;
      if (description !== initialFormState.description) updatePayload.description = description;

      if (!areSourcesEqual(sources, initialSourcesState)) {
        updatePayload.filter_criteria = sources.map((source) => {
          const baseSource = {
            source: source.source,
            platform: source.platform,
            keywords: source.keywords,
            urls: source.source === 'rss feed'
              ? source.urls.filter(url => url.trim() !== "")
              : undefined,
            interval: source.intervalValue * conversionFactors[source.intervalUnit],
          };

          if (source.id) {
            baseSource.id = source.id;
          }

          return baseSource;
        });
      }

      if (Object.keys(updatePayload).length === 0) {
        toast.info("No changes detected.");
        return;
      }
    }

    setIsSubmitting(true);

    // Clean payload - remove input fields from sources
    const postData = {
      name: filterName,
      description: description,
      filter_criteria: sources.map((source) => {
        const baseSource = {
          source: source.source,
          platform: source.platform,
          keywords: source.keywords,
          urls: source.source === 'rss feed'
            ? source.urls.filter(url => url.trim() !== "")
            : undefined,
          interval: source.intervalValue * conversionFactors[source.intervalUnit],
        };

        // Only include id if it exists and we're updating
        if (filterDetails?.id && source.id) {
          baseSource.id = source.id;
        }

        return baseSource;
      }),
    };

    console.log("postdata save filter", postData);

    try {
      const url = filterDetails?.id
        ? `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/filter/${filterDetails.id}`
        : `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/filter`;

      const method = filterDetails?.id ? 'put' : 'post';
      const payload = filterDetails?.id ? updatePayload : postData;

      const response = await axios[method](url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      window.dispatchEvent(new Event('databaseUpdated'));
      console.log("responseFilter", response)

      if (response.status === 200) {
        if (filterDetails?.id) {
          toast.success(`Filter updated successfully: ${response.data.data.name}`);
        } else {
          toast.success(`Filter created successfully: ${response.data.data.name}`);
        }

        const newFilterId = Number(response.data.data.id);
        setFilterId((prevFilterIds) => [...prevFilterIds, newFilterId]);

        if (!filterDetails?.id) {
          onNewFilterCreated(newFilterId, false);
        }
        onClose();
      } else {
        toast.error('Unexpected response from server.');
      }
    } catch (error) {
      console.error('Error posting data:', error);
      toast.error('Error during filter creation: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSource = (sourceIndex) => {
    if (sources.length > 1) {
      setSources(prevSources => prevSources.filter((_, index) => index !== sourceIndex));
    } else {
      toast.info("At least one source is required");
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1]?.focus();
    }
  };

  return (
    <div className="p-1">
      <Form
        noValidate
        style={{ marginTop: '10px' }}
        onSubmit={(e) => {
          e.preventDefault();

          const validationErrors = validateForm();
          if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
          }

          handleSaveFilter();
        }}
      >

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: "20px",
              cursor: "pointer",
              color: "white",
              background: "none",
              border: "none",
            }}
            aria-label="Close form"
          >
            &times;
          </button>
        </div>

        <Form.Group className="mb-3">
          <InputField
            label="Filter Name *"
            type="text"
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value.replace(/\b\w/g, (char) => char.toUpperCase()));
              setError(prev => ({ ...prev, name: '' }));
            }}
            placeholder="Enter your filter name"
            autoComplete="filter-name"
            name="filtername"
            onKeyDown={handleEnterKey}
            disabled={filterDetails?.id && !isEditable}
            readOnly={isReadOnly}
            onFocus={handleFocus}
            ref={inputRef}
          // error={!!error.name}
          />
          {error.name && <p className='error' style={{ color: "red", }}>{error.name}</p>}
        </Form.Group>
        <Form.Group className="mb-3">
          <InputField
            label="Description"
            placeholder="Please enter a description here"
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
            }}
            onKeyDown={handleEnterKey}
            style={{ backgroundColor: "white", color: "black" }}
            disabled={filterDetails?.id && !isEditable}
            required={false}
          />

        </Form.Group>

        <div>
          <div ref={containerRef} className='sourceDiv'>
            {sources.map((source, sourceIndex) => (
              <div key={sourceIndex} className="mb-3 border rounded" ref={sourceIndex === sources.length - 1 ? lastSourceRef : null}>
                {sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSource(sourceIndex)}
                    style={{
                      display: 'flex',
                      justifyContent: 'end',
                      fontSize: '15px',
                      right: '6px',
                      cursor: 'pointer',
                      color: 'white',
                      // marginTop: '25px',
                      background: 'none',
                      border: 'none',
                      width: '100%'
                    }}
                    disabled={!isEditable}
                    aria-label={`Remove source ${sourceIndex + 1}`}
                  >
                    &times;
                  </button>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <DropdownField
                      label="Source *"
                      source={"Select Source"}
                      value={source.source}
                      onChange={(e) => handleSourceChange(sourceIndex, e)}
                      disabled={filterDetails?.id && !isEditable}
                      required={false}
                      // error={!!error.sources?.[sourceIndex]?.source}
                      options={[
                        { label: 'Social Media', value: 'social media' },
                        { label: 'Social Media Profile', value: 'social media profile' },
                        { label: 'RSS Feed', value: 'rss feed' },
                        { label: 'Dark Web', value: 'dark web' },
                      ]}
                    />
                  </div>
                  {/* {error.sources?.[sourceIndex]?.source && (
                    <p className='custom-error' style={{ color: 'red', margin: '5px !important' }}>{error.sources[sourceIndex].source}</p>
                  )} */}

                  {source.source && source.source !== 'rss feed' && source.source !== 'dark web' && (
                    <div className="col-md-6">

                      <DropdownField
                        label="Select Platform *"
                        source={"Select Platform"}
                        value={source.platform}
                        onChange={(e) => handlePlatformChange(sourceIndex, e)}
                        style={{ width: '96%' }}
                        disabled={filterDetails?.id && !isEditable}
                        required={false}
                        error={!!error.sources?.[sourceIndex]?.platform}
                        options={platform.map((plat) => ({
                          label: plat,
                          value: plat
                        }))}
                      />
                      {error.sources?.[sourceIndex]?.platform && (
                        <p className='custom-error' style={{ color: 'red', margin: '5px !important' }}>{error.sources[sourceIndex].platform}</p>
                      )}
                    </div>
                  )}

                  {source.source && (
                    <div className="col-md-6">
                      <IntervalField
                        label="Monitoring Interval"
                        value={source.intervalValue}
                        unit={source.intervalUnit}
                        onValueChange={(val) => handleIntervalValueChange(sourceIndex, val)}
                        onUnitChange={(unit) => handleIntervalUnitChange(sourceIndex, unit)}
                        disabled={filterDetails?.id && !isEditable}
                        allowedHourValues={[3, 6, 9, 12]}
                        isDarkWeb={source.source === 'dark web'}
                      />
                      {error.sources?.[sourceIndex]?.intervalValue && (
                        <p style={{ color: 'red', margin: 0 }}>{error.sources[sourceIndex].intervalValue}</p>
                      )}
                      {error.sources?.[sourceIndex]?.intervalUnit && (
                        <p style={{ color: 'red', margin: 0 }}>{error.sources[sourceIndex].intervalUnit}</p>
                      )}
                    </div>
                  )}

                  {source.source && source.source !== 'rss feed' && (
                    <div className="col-md-6" style={{ marginRight: '5px', width: '45%' }}>
                      <InputField
                        label={source.source === "social media profile" ? `User ID *(up to   ${keywordLimit} user ids)` : `Keyword *(up to  ${keywordLimit} keywords)`}
                        type="text"
                        placeholder={source.source === "social media profile" ? "Please press Enter to add userID" : "Please press Enter to add keyword"}
                        value={source.keywordInput}
                        onChange={(e) => handleKeywordChange(sourceIndex, e.target.value)}
                        onKeyDown={(e) => handleKeywordKeyDown(sourceIndex, e)}
                        disabled={filterDetails?.id && !isEditable}
                        style={{ maxWidth: '96%' }}
                        error={!!error.sources?.[sourceIndex]?.keywords}
                      // required={false}
                      />
                      <div className="mt-21" style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                        {source.keywords.map((keyword, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            pill
                            bg="rgba(0, 115, 207, 0.3)"
                            className="me-2 mb-1 d-inline-flex align-items-center custom-badge"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minWidth: "auto",
                              maxWidth: "100%",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              border: "1px solid rgb(0, 115, 207)",
                              color: "rgb(0, 115, 207)",
                            }}
                          >
                            {keyword}
                            {(!filterDetails?.id || isEditable) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteKeyword(sourceIndex, keyIndex)}
                                className="text-light p-0 ms-1"
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  color: "rgb(0, 115, 207)",
                                  cursor: "pointer",
                                }}
                                aria-label="Delete keyword"
                              >
                                X
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {error.sources?.[sourceIndex]?.keywords && (
                        <p className="error" style={{ color: "red", margin: 0 }}>
                          {error.sources[sourceIndex].keywords}
                        </p>
                      )}
                    </div>
                  )}

                  {source.source === 'rss feed' && (
                    <div className="col-md-6">
                      <InputField
                        label={`RSS URL (up to ${keywordLimit} urls)`}
                        type="text"
                        placeholder={"Enter RSS URL and press Enter"}
                        value={source.urlInput}
                        onChange={(e) => handleUrlChange(sourceIndex, e.target.value)}
                        onKeyDown={(e) => handleUrlKeyDown(sourceIndex, e)}
                        disabled={filterDetails?.id && !isEditable}
                        style={{ width: '96%' }}
                        required={false}
                      />

                      <div className="mt-1" style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                        {source.urls.filter((url) => url.trim() !== "").map((url, urlIndex) => (
                          <Badge
                            key={urlIndex}
                            pill
                            bg="rgba(0, 115, 207, 0.3)"
                            radius={30}
                            className="me-2 mb-2 d-inline-flex align-items-center custom-badge"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minWidth: "auto",
                              maxWidth: "100%",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              border: "1px solid rgb(0, 115, 207)",
                              color: "rgb(0, 115, 207)",
                            }}
                          >
                            {url}
                            {(!filterDetails?.id || isEditable) && (
                              <button
                                type="button"
                                className="text-light p-0 ms-1"
                                onClick={() => handleDeleteUrl(sourceIndex, urlIndex)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  color: "rgb(0, 115, 207)",
                                  cursor: "pointer",
                                }}
                              >
                                X
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {error.sources?.[sourceIndex]?.urls && (
                        <p className='error' style={{ color: 'red', margin: 0 }}>{error.sources[sourceIndex].urls}</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}

            {(!filterDetails?.id || isEditable) && (
              <AppButton onClick={handleAddSource}> + Add Source</AppButton>
            )}

            <span style={{ marginLeft: '5px' }}>
              <AppButton
                // onClick={() => {
                //   const validationErrors = validateForm();
                //   if (Object.keys(validationErrors).length > 0) {
                //     setError(validationErrors);  
                //     return;
                //   }
                //   handleSaveFilter();  
                // }}
                disabled={filterDetails?.id && (!isEditable || !isChanged || isSubmitting)}
              >
                {isSubmitting
                  ? (filterDetails?.id ? 'Updating...' : 'Saving...')
                  : (filterDetails?.id ? 'Update Filter' : 'Save Filter')}
              </AppButton>

            </span>
          </div>
        </div>
      </Form>
    </div>
  );
};
AddNewFilter.propTypes = {
  onNewFilterCreated: PropTypes.func.isRequired,
  filterIde: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};
export default AddNewFilter;
