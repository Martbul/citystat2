
  // Calculate points for a polygon
  export const getPolygonPoints = (values: number[],center:number,maxRadius:number,maxValue:number ) => {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / values.length - Math.PI / 2;
      const radius = (value / maxValue) * maxRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      return [x, y];
    });
  };

  // Get label position
  export const getLabelPosition = (index: number,center:number,maxRadius:number,data:any[]) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const x = center + Math.cos(angle) * (maxRadius + 25);
    const y = center + Math.sin(angle) * (maxRadius + 25);
    return { x, y };
  };

  // Get grid polygon points
  export const getGridPoints = (scale: number,center:number,maxRadius:number,data:any[]) => {
    return data
      .map((_, index) => {
        const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
        const radius = maxRadius * scale;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return `${x},${y}`;
      })
      .join(" ");
  };

 