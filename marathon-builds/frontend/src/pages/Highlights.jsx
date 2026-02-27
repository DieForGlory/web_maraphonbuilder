import { useState, useEffect } from 'react';

export default function Highlights() {
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', file: null });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Состояние прогресса

  const API_BASE = "https://5mpxwrp0-5000.euw.devtunnels.ms";

  const loadVideos = () => {
    fetch(`${API_BASE}/api/community/highlights`)
      .then(res => res.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Ошибка загрузки видео:", err));
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadData.file) return;

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);

    const token = localStorage.getItem('token');

    // Используем XMLHttpRequest для отслеживания прогресса
    const xhr = new XMLHttpRequest();

    xhr.open('POST', `${API_BASE}/api/community/highlights`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    // Отслеживание прогресса загрузки
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setLoading(false);
      if (xhr.status === 201) {
        setShowModal(false);
        setUploadData({ title: '', description: '', file: null });
        loadVideos();
      } else {
        const response = JSON.parse(xhr.responseText);
        alert(`Ошибка: ${response.error || "Сбой передачи"}`);
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      alert("Сбой соединения с сервером");
    };

    xhr.send(formData);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Шапка секции */}
      <div className="flex justify-between items-end border-b border-m-pink pb-4">
        <div>
          <h2 className="text-2xl text-m-pink uppercase tracking-widest">&gt; ТРАНСЛЯЦИЯ ХАЙЛАЙТОВ</h2>
          <p className="text-[10px] text-m-cyan opacity-50 uppercase mt-1">Входящий поток данных активен</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-m-pink/10 border border-m-pink text-m-pink px-6 py-2 uppercase text-xs font-bold hover:bg-m-pink hover:text-black transition-all shadow-[0_0_10px_rgba(255,0,85,0.2)]"
        >
          Загрузить момент
        </button>
      </div>

      {/* Сетка видео */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(vid => (
          <div key={vid.id} className="group border border-white/10 bg-[#0C0C0D] transition-all hover:border-m-acid flex flex-col">
            <div className="aspect-video bg-black relative overflow-hidden">
              <video
                src={`${API_BASE}${vid.video_url}`}
                controls
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="p-4 bg-m-black/40">
              <h3 className="text-m-cyan font-bold uppercase tracking-wider text-sm truncate">{vid.title}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] text-gray-500 uppercase">Автор: {vid.author}</span>
                <span className="text-[9px] text-m-acid uppercase tracking-tighter">СИНХРОНИЗИРОВАНО</span>
              </div>
            </div>
          </div>
        ))}
        {videos.length === 0 && <div className="col-span-full py-20 text-center text-gray-600 uppercase text-xs tracking-[0.3em]">Нет активных трансляций</div>}
      </div>

      {/* Модальное окно загрузки */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C0C0D] border border-m-pink p-8 w-full max-w-md space-y-6 shadow-[0_0_40px_rgba(255,0,85,0.2)]">
            <div className="border-b border-m-pink/30 pb-2">
              <h3 className="text-xl text-m-pink uppercase tracking-widest">ПЕРЕДАЧА ДАННЫХ</h3>
              <p className="text-[9px] text-gray-500 uppercase">Канал связи: Зашифрован</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-m-cyan uppercase">Метка трансляции</label>
                <input
                  required
                  disabled={loading}
                  className="w-full bg-m-black border border-white/10 p-3 text-xs text-white focus:border-m-cyan outline-none transition-colors disabled:opacity-50"
                  placeholder="Введите название..."
                  onChange={e => setUploadData({...uploadData, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-m-cyan uppercase">Лог описания</label>
                <textarea
                  disabled={loading}
                  className="w-full bg-m-black border border-white/10 p-3 text-xs text-white focus:border-m-cyan outline-none h-20 resize-none transition-colors disabled:opacity-50"
                  placeholder="Добавьте контекст..."
                  onChange={e => setUploadData({...uploadData, description: e.target.value})}
                />
              </div>

              {!loading ? (
                <div className="border border-dashed border-white/20 p-6 text-center group hover:border-m-cyan/50 transition-colors">
                  <input
                    required
                    type="file"
                    accept="video/*"
                    onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                    className="text-[10px] text-gray-500 file:bg-m-pink/10 file:border-m-pink file:text-m-pink file:text-[9px] file:uppercase file:px-3 file:py-1 file:mr-4 file:hover:bg-m-pink file:hover:text-black file:transition-colors"
                  />
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-m-cyan animate-pulse">Передача пакетов...</span>
                    <span className="text-white">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-m-pink shadow-[0_0_10px_rgba(255,0,85,0.8)] transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[8px] text-gray-600 uppercase text-center tracking-tighter">Не разрывайте соединение с UESC</p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-600 text-gray-400 py-3 uppercase text-[10px] hover:text-white hover:border-white transition-colors disabled:opacity-30"
                >
                  Отмена
                </button>
                {!loading && (
                  <button
                    type="submit"
                    className="flex-1 bg-m-pink text-black py-3 uppercase text-[10px] font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(255,0,85,0.3)]"
                  >
                    Начать передачу
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}