import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  Package, Plus, Trash2, Image as ImageIcon,
  Tag, Info, Loader2, ArrowLeft, Upload, X, Search, Pencil, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import { getProductImage } from "../../utils/imageUtils";

export default function AdminProducts({ setToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingImages, setViewingImages] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    sizes: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setToast("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const getImagesAsArray = (img) => {
    if (!img) return [];
    if (Array.isArray(img)) return img;
    if (typeof img === 'string' && img.startsWith('[')) {
      try {
        return JSON.parse(img);
      } catch (e) { }
    }
    return [img];
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setToast(`${file.name} is too large. Max 2MB.`);
        return;
      }
      validFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...validFiles]);
    // Reset input value so same file can be selected again
    if (e.target) e.target.value = "";
  };

  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];
    const isExisting = typeof previewToRemove === 'string' && !previewToRemove.startsWith('data:');

    if (isExisting) {
      setExistingImages(prev => prev.filter(url => url !== previewToRemove));
    } else {
      const newPreviews = imagePreviews.filter(p => typeof p !== 'string' || p.startsWith('data:'));
      const newIdx = newPreviews.indexOf(previewToRemove);
      setImageFiles(prev => prev.filter((_, i) => i !== newIdx));
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || (imageFiles.length === 0 && existingImages.length === 0)) {
      setToast("Please fill all fields and select at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload New Images
      const newImageUrls = await Promise.all(imageFiles.map(file => uploadImage(file)));
      const finalImageUrls = [...existingImages, ...newImageUrls];

      if (editingProduct) {
        // Update Product
        const { error } = await supabase
          .from("products")
          .update({
            name: form.name,
            price: parseFloat(form.price),
            description: form.description,
            img: finalImageUrls,
            sizes: form.sizes
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
        setToast("Product updated successfully!");
      } else {
        // Insert Product
        const { error } = await supabase
          .from("products")
          .insert([
            {
              name: form.name,
              price: parseFloat(form.price),
              description: form.description,
              img: finalImageUrls,
              sizes: form.sizes
            }
          ]);

        if (error) throw error;
        setToast("Product added successfully!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error.message);
      setToast(`Failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", description: "", sizes: [] });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingProduct(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startEdit = (product) => {
    const images = getImagesAsArray(product.img);
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      sizes: product.sizes || []
    });
    setExistingImages(images);
    setImagePreviews(images);
    setImageFiles([]);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const initiateDelete = (id, imageUrl) => {
    setProductToDelete({ id, imageUrl });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (dbError) throw dbError;

      // 2. Try to delete from storage if it's a Supabase URL
      const imagesToDelete = Array.isArray(productToDelete.imageUrl)
        ? productToDelete.imageUrl
        : [productToDelete.imageUrl];

      const filePaths = imagesToDelete
        .filter(url => url && url.includes('supabase.co/storage/v1/object/public/products/'))
        .map(url => url.split('products/').pop());

      if (filePaths.length > 0) {
        try {
          const { error: storageError } = await supabase.storage.from('products').remove(filePaths);
          if (storageError) console.warn("Storage cleanup failed:", storageError.message);
        } catch (storageErr) {
          console.warn("Storage removal logic error:", storageErr);
        }
      }

      setToast("Product deleted successfully!");
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setToast(`Delete Failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link to="/admin" className="text-brand flex items-center gap-1 text-sm font-bold mb-2 hover:underline">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <Package className="text-brand" size={32} />
              Product Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your storefront dynamically</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl w-full sm:w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingProduct ? <ImageIcon className="text-brand" size={20} /> : <Plus className="text-brand" size={20} />}
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                {editingProduct && (
                  <button
                    onClick={resetForm}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Oversized Black Tee"
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="699"
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Detailed Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your product in detail..."
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-medium resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2 px-1">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const newSizes = form.sizes.includes(size)
                            ? form.sizes.filter(s => s !== size)
                            : [...form.sizes, size];
                          setForm({ ...form, sizes: newSizes });
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${form.sizes.includes(size)
                          ? 'bg-brand border-brand text-white'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-brand/20'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Product Images</label>
                  <div className="space-y-4">
                    {/* Grid of Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden aspect-square border-2 border-brand/20 group/preview">
                            <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover/preview:opacity-100"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Trigger */}
                    <label className="flex flex-col items-center justify-center w-full px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-brand/5 hover:border-brand/40 transition-all group">
                      <Upload className="text-gray-400 mb-2 group-hover:text-brand transition-colors" size={24} />
                      <p className="text-xs font-bold text-gray-500 group-hover:text-brand transition-colors">
                        {imagePreviews.length > 0 ? "Add more images" : "Select from device"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Max 2MB per image</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand/20 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingProduct ? <CheckCircle2 size={20} /> : <Plus size={20} />)}
                  {isSubmitting ? "Saving..." : (editingProduct ? "Update Product" : "Add Product")}
                </button>
              </form>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products
                .filter(p =>
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex gap-4 group hover:shadow-md transition-all">
                    <div
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 relative cursor-pointer group/img"
                      onClick={() => {
                        const imgs = getImagesAsArray(product.img);
                        setViewingImages(imgs);
                      }}
                    >
                      <img
                        src={getProductImage(product.img)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                      />
                      {getImagesAsArray(product.img).length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                          <ImageIcon size={10} />
                          {getImagesAsArray(product.img).length}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <Search size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                        <p className="text-brand font-black">₹{product.price}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 italic">{product.description}</p>
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {product.sizes.map(s => (
                              <span key={s} className="text-[8px] font-black bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded-md border border-gray-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-brand hover:underline uppercase tracking-widest"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => initiateDelete(product.id, product.img)}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && !loading && (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-100">
                    <Package className="mx-auto mb-4 text-gray-200" size={64} />
                    <h3 className="text-xl font-bold text-gray-400">
                      {searchTerm ? "No matching products" : "No products found"}
                    </h3>
                    <p className="text-gray-400">
                      {searchTerm ? "Try a different search term" : "Add your first product to get started"}
                    </p>
                  </div>
                )}

              {loading && (
                <div className="col-span-full py-20 flex justify-center">
                  <Loader2 className="animate-spin text-brand" size={40} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Product?"
        message="This will permanently remove the product from your store and storage. This action cannot be undone."
      />

      {/* Image Viewer Modal */}
      {viewingImages && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col gap-6">
            <button
              onClick={() => setViewingImages(null)}
              className="absolute -top-12 right-0 text-white hover:text-brand transition-colors flex items-center gap-2 font-bold"
            >
              <X size={24} /> Close
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {viewingImages.map((img, idx) => (
                <div key={idx} className="rounded-3xl overflow-hidden aspect-square bg-gray-900 border border-white/10 group">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
