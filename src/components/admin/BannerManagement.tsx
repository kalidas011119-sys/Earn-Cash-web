import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService } from '../../services/db';
import { Banner } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

export const BannerManagement: React.FC = () => {
  const { state } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('#earn');
  const [isActive, setIsActive] = useState(true);

  const openAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setImageUrl('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80');
    setLink('#earn');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setImageUrl(b.imageUrl);
    setLink(b.link);
    setIsActive(b.isActive);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveBanner(
      {
        ...(editingBanner ? { id: editingBanner.id } : {}),
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        link: link.trim(),
        isActive
      },
      'ADMIN_8471835378'
    );
    setModalOpen(false);
  };

  const confirmDeleteBanner = () => {
    if (bannerToDelete) {
      dbService.deleteBanner(bannerToDelete.id, 'ADMIN_8471835378');
      setBannerToDelete(null);
    }
  };

  const toggleActive = (b: Banner) => {
    dbService.saveBanner({ id: b.id, isActive: !b.isActive }, 'ADMIN_8471835378');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Home Screen Banner Management</h2>
          <p className="text-xs text-slate-400">
            Active banners automatically display on user home screen carousel
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.banners.map((b) => (
          <div
            key={b.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-3 flex flex-col justify-between"
          >
            <div className="relative aspect-16/9 bg-slate-950">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <span
                className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.isActive
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {b.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <h3 className="text-sm font-bold text-white line-clamp-1">{b.title}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">Link: {b.link}</p>
            </div>

            <div className="p-4 pt-0 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => toggleActive(b)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{b.isActive ? 'Hide' : 'Activate'}</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBannerToDelete(b)}
                  className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Banner Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Delete Banner?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove banner &ldquo;{bannerToDelete.title}&rdquo;?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteBanner}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Link</label>
                <input
                  type="text"
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="banActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="banActive" className="text-slate-300 font-bold">
                  Active (Display immediately on User Home)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
