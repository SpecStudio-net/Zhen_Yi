const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  journal: {
    load:         ()           => ipcRenderer.invoke('journal:load'),
    save:         (entry)      => ipcRenderer.invoke('journal:save', entry),
    updateNotes:  (id, notes)  => ipcRenderer.invoke('journal:update-notes', id, notes),
    toggleHidden: (id)         => ipcRenderer.invoke('journal:toggle-hidden', id),
  },

  // Callback-based streaming bridge. Returns a cleanup function.
  // onChunk(text), onDone(), onError(Error)
  streamCompletion(systemPrompt, messages, onChunk, onDone, onError) {
    const requestId = `${Date.now()}-${Math.random()}`;

    const onChunkIPC = (_, data) => {
      if (data.requestId === requestId) onChunk(data.chunk);
    };
    const onDoneIPC = (_, data) => {
      if (data.requestId === requestId) { cleanup(); onDone(); }
    };
    const onErrorIPC = (_, data) => {
      if (data.requestId === requestId) { cleanup(); onError(new Error(data.message)); }
    };

    function cleanup() {
      ipcRenderer.removeListener('completion:chunk', onChunkIPC);
      ipcRenderer.removeListener('completion:done',  onDoneIPC);
      ipcRenderer.removeListener('completion:error', onErrorIPC);
    }

    ipcRenderer.on('completion:chunk', onChunkIPC);
    ipcRenderer.on('completion:done',  onDoneIPC);
    ipcRenderer.on('completion:error', onErrorIPC);

    ipcRenderer.invoke('completion:stream', { requestId, systemPrompt, messages });

    return cleanup;
  },

});
