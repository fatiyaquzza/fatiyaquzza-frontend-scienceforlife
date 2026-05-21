export const MAX_QUESTION_OPTIONS = 26;

export const getOptionLabel = (index) => String.fromCharCode(65 + index);

export const defaultQuestionOptions = () => [{ label: "A", text: "" }];

export const relabelOptions = (options) =>
  options.map((opt, idx) => ({
    ...opt,
    label: getOptionLabel(idx),
  }));

export const sortOptionsByLabel = (options) =>
  [...options].sort((a, b) => {
    const labelA = a.option_label || a.label || "";
    const labelB = b.option_label || b.label || "";
    return labelA.localeCompare(labelB);
  });

export const mapApiOptionsToForm = (apiOptions) => {
  if (!apiOptions?.length) return defaultQuestionOptions();
  return sortOptionsByLabel(apiOptions).map((opt) => ({
    label: opt.option_label,
    text: opt.option_text,
  }));
};
