import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { IconPicker } from '../ui/IconPicker';
import { useStore } from '../../store';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectForm({ open, onClose }: ProjectFormProps) {
  const createProject = useStore((s) => s.createProject);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('folder');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject({ name: name.trim(), color, icon });
    setName('');
    setColor('#6366f1');
    setIcon('folder');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau projet">
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du projet…"
          className="w-full text-base bg-transparent border-b-2 border-[var(--border)]
                     focus:border-[var(--accent)] pb-2 text-[var(--text-primary)]
                     placeholder:text-[var(--text-muted)] focus:outline-none"
        />

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Couleur</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Icône</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>
            Créer le projet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
