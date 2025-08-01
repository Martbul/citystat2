export const dataCombinator = (sections) => {
  return sections.reduce((acc, section) => {
    acc.push({ type: "header", title: section.title });
    acc.push(...section.data.map((item) => ({ ...item, type: "item" })));

    return acc;
  }, []);
};
