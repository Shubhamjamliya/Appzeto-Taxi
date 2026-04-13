import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Copy,
  Eye,
  Languages,
  Loader2,
  Save,
  Smartphone,
  Type,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  buildReferralPreviewBlocks,
  createEmptyReferralTranslationRecord,
  DRIVER_REFERRAL_TRANSLATION_FIELDS,
  USER_REFERRAL_TRANSLATION_FIELDS,
} from '../../../shared/utils/referralTranslationFields';

const inputClass =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors';
const labelClass = 'block text-xs font-semibold text-gray-500 mb-1.5';

const ToolbarButton = ({ children, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="h-9 min-w-9 px-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
  >
    {children}
  </button>
);

const HtmlEditor = ({ label, value, onChange, plainText = false }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current || plainText) {
      return;
    }

    if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [plainText, value]);

  const syncEditor = () => {
    if (plainText) {
      return;
    }

    onChange(editorRef.current?.innerHTML || '');
  };

  const runCommand = (command, commandValue = null) => {
    if (!editorRef.current || plainText) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    syncEditor();
  };

  const insertLink = () => {
    const link = window.prompt('Enter link URL');
    if (!link) {
      return;
    }
    runCommand('createLink', link);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {plainText ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} min-h-[110px] resize-y`}
          placeholder="Enter banner text"
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-3 bg-gray-50/70">
            <select
              defaultValue="P"
              onChange={(event) => {
                runCommand('formatBlock', event.target.value);
                event.target.value = 'P';
              }}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
            >
              <option value="P">Paragraph</option>
              <option value="H3">Heading 3</option>
              <option value="H4">Heading 4</option>
              <option value="BLOCKQUOTE">Quote</option>
            </select>
            <ToolbarButton title="Bold" onClick={() => runCommand('bold')}>
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton title="Italic" onClick={() => runCommand('italic')}>
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton title="Link" onClick={insertLink}>
              Link
            </ToolbarButton>
            <ToolbarButton title="Bullet list" onClick={() => runCommand('insertUnorderedList')}>
              Bullets
            </ToolbarButton>
            <ToolbarButton title="Numbered list" onClick={() => runCommand('insertOrderedList')}>
              1.
            </ToolbarButton>
            <ToolbarButton title="Clear formatting" onClick={() => runCommand('removeFormat')}>
              Clear
            </ToolbarButton>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditor}
            className="min-h-[170px] px-4 py-3 text-sm text-gray-800 outline-none prose prose-sm max-w-none"
          />
        </div>
      )}
    </div>
  );
};

const PreviewCard = ({ title, code, bannerText, blocks }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
        <Smartphone size={18} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400">Live mobile preview for the selected language.</p>
      </div>
    </div>

    <div className="mx-auto w-[255px] rounded-[28px] border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-[15px] font-semibold text-gray-900">Referrals</span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.18em]">Preview</span>
      </div>

      <div className="bg-indigo-700 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[20px] font-bold leading-tight">{bannerText || 'Refer and Earn'}</p>
          <p className="text-[11px] text-indigo-100 mt-1">Updated from translation config</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <Type size={18} />
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="rounded-xl border border-dashed border-gray-300 px-3 py-3 text-center">
            <p className="text-[15px] font-semibold text-gray-900">{code}</p>
            <p className="text-[10px] text-gray-400 mt-1">Your referral code</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-indigo-700 text-white px-4 text-sm font-medium flex items-center gap-2"
          >
            <Copy size={14} /> Copy
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button type="button" className="rounded-lg bg-gray-900 text-white py-2 text-xs font-medium">
            Refer and earn
          </button>
          <button type="button" className="rounded-lg bg-gray-100 text-gray-500 py-2 text-xs font-medium">
            Referral history
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 min-h-[270px]">
        <h4 className="text-[13px] font-semibold text-gray-900">How it works?</h4>
        {blocks.length === 0 ? (
          <p className="text-xs text-gray-400">No content saved for this language yet.</p>
        ) : (
          blocks.slice(0, 3).map((block) => (
            <div key={block.key}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-1">
                {block.label}
              </p>
              <div
                className="text-[12px] text-gray-700 leading-5 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            </div>
          ))
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="w-full rounded-xl bg-rose-500 text-white py-3 text-sm font-semibold"
        >
          Refer now
        </button>
      </div>
    </div>
  </div>
);

const TranslationSectionCard = ({ title, description, icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">{children}</div>
  </div>
);

const ReferralTranslation = () => {
  const [records, setRecords] = useState([]);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await adminService.getReferralTranslations();
        const items = response?.data?.results || [];
        const safeItems = items.length > 0 ? items : [createEmptyReferralTranslationRecord()];
        setRecords(safeItems);
        setSelectedLanguageCode((current) => current || safeItems[0]?.language_code || 'en');
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load referral translation data.');
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, []);

  const selectedRecord =
    records.find((item) => item.language_code === selectedLanguageCode) || records[0] || createEmptyReferralTranslationRecord();

  const visibleLanguageRecords = records.filter(
    (item) => item.active || item.default_status || item._id || item.language_code === selectedLanguageCode,
  );

  const updateSelectedRecord = (sectionKey, fieldKey, nextValue) => {
    setRecords((current) =>
      current.map((item) =>
        item.language_code === selectedLanguageCode
          ? {
              ...item,
              [sectionKey]: {
                ...(item[sectionKey] || {}),
                [fieldKey]: nextValue,
              },
            }
          : item,
      ),
    );
    setMessage('');
  };

  const handleSave = async () => {
    if (!selectedRecord?.language_code) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await adminService.updateReferralTranslation(selectedRecord.language_code, {
        language_name: selectedRecord.language_name,
        user_referral: selectedRecord.user_referral,
        driver_referral: selectedRecord.driver_referral,
      });

      const savedRecord = response?.data;
      setRecords((current) =>
        current.map((item) => (item.language_code === savedRecord.language_code ? savedRecord : item)),
      );
      setMessage(`Saved ${savedRecord.language_name || savedRecord.language_code} referral translation.`);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || 'Unable to save referral translation.');
    } finally {
      setSaving(false);
    }
  };

  const userPreviewBlocks = buildReferralPreviewBlocks(
    selectedRecord.user_referral,
    USER_REFERRAL_TRANSLATION_FIELDS,
  );
  const driverPreviewBlocks = buildReferralPreviewBlocks(
    selectedRecord.driver_referral,
    DRIVER_REFERRAL_TRANSLATION_FIELDS,
  );

  if (loading) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Referral Management</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Translation</span>
        </div>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Referral Translation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage user and driver referral copy by language and push the same content to live referral screens.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
              <Languages size={16} className="text-indigo-600" />
              {selectedRecord.language_name || selectedRecord.language_code}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {selectedRecord.updatedAt ? 'Update Translation' : 'Save Translation'}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PreviewCard
          title="Mobile View - User Referral"
          code="USERCODE"
          bannerText={selectedRecord.user_referral?.banner_text}
          blocks={userPreviewBlocks}
        />
        <PreviewCard
          title="Mobile View - Driver Referral"
          code="DRVCODE"
          bannerText={selectedRecord.driver_referral?.banner_text}
          blocks={driverPreviewBlocks}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2">
          {visibleLanguageRecords.map((language) => (
            <button
              key={language.language_code}
              type="button"
              onClick={() => {
                setSelectedLanguageCode(language.language_code);
                setMessage('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguageCode === language.language_code
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {language.language_name || language.language_code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="space-y-6">
          <TranslationSectionCard
            title="User Referral"
            description="Text blocks shown on rider referral screens for the selected language."
            icon={<Eye size={18} />}
          >
            {USER_REFERRAL_TRANSLATION_FIELDS.map((field) => (
              <HtmlEditor
                key={field.key}
                label={field.label}
                plainText={field.plainText}
                value={selectedRecord.user_referral?.[field.key] || ''}
                onChange={(nextValue) => updateSelectedRecord('user_referral', field.key, nextValue)}
              />
            ))}
          </TranslationSectionCard>

          <TranslationSectionCard
            title="Driver Referral"
            description="Text blocks shown on driver referral screens for the selected language."
            icon={<Languages size={18} />}
          >
            {DRIVER_REFERRAL_TRANSLATION_FIELDS.map((field) => (
              <HtmlEditor
                key={field.key}
                label={field.label}
                plainText={field.plainText}
                value={selectedRecord.driver_referral?.[field.key] || ''}
                onChange={(nextValue) => updateSelectedRecord('driver_referral', field.key, nextValue)}
              />
            ))}
          </TranslationSectionCard>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Translation'}
            </button>
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Selected language:
              <span className="ml-1 font-medium text-gray-900">
                {selectedRecord.language_name || selectedRecord.language_code}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Languages size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">How this flows</h3>
                <p className="text-xs text-gray-400">Single-source referral copy pipeline.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>Admin saves one language at a time from this page.</li>
              <li>Content is stored in backend per language code.</li>
              <li>User and driver referral pages fetch the same saved content through a public common endpoint.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralTranslation;
