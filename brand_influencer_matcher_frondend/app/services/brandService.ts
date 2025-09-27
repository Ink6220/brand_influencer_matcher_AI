interface Brand {
  name: string;
}

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const response = await fetch('http://localhost:8000/api/v1/brands');
    
    if (!response.ok) {
      throw new Error(`Error fetching brands: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
}
