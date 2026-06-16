import { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Phone,
  Pencil,
  UserPlus,
  Trash2,
  Save,
  X,
  Plus,
  Users,
  AlertCircle,
} from 'lucide-react';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Crew, Employee, Equipment, ServiceType } from '@/types';
import { getInitials } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatsCard from '@/components/StatsCard';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  useCrews,
  useCreateCrew,
  useUpdateCrew,
  useDeleteCrew,
  useAddCrewMember,
  useUpdateCrewMember,
  useRemoveCrewMember,
} from '@/hooks';

function getCrewStatusBadge(status: Crew['status']): { variant: 'success' | 'warning' | 'neutral' | 'info'; label: string } {
  switch (status) {
    case 'available': return { variant: 'success', label: 'Available' };
    case 'on-job': return { variant: 'info', label: 'On Job' };
    case 'break': return { variant: 'warning', label: 'On Break' };
    case 'off-duty': return { variant: 'neutral', label: 'Off Duty' };
    default: return { variant: 'neutral', label: status };
  }
}

const ROLE_OPTIONS = [
  { value: 'crew-lead', label: 'Crew Lead' },
  { value: 'technician', label: 'Technician' },
  { value: 'driver', label: 'Driver' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'on-job', label: 'On Job' },
  { value: 'break', label: 'On Break' },
  { value: 'off-duty', label: 'Off Duty' },
];

const ALL_SPECIALTIES: { value: ServiceType; label: string }[] = Object.entries(SERVICE_TYPES).map(
  ([key, cfg]) => ({ value: key as ServiceType, label: cfg.label }),
);

// --- Edit Crew Modal ---

function EditCrewModal({
  crew,
  isOpen,
  onClose,
}: {
  crew: Crew;
  isOpen: boolean;
  onClose: () => void;
}) {
  const updateCrew = useUpdateCrew();
  const [name, setName] = useState(crew.name);
  const [serviceZone, setServiceZone] = useState(crew.serviceZone);
  const [status, setStatus] = useState<Crew['status']>(crew.status);
  const [specialties, setSpecialties] = useState<ServiceType[]>([...crew.specialties]);

  const toggleSpecialty = (s: ServiceType) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSave = () => {
    updateCrew.mutate(
      { id: crew.id, name, serviceZone, status, specialties },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Crew" size="lg">
      <div className="space-y-4">
        <Input label="Crew Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Service Zone" value={serviceZone} onChange={(e) => setServiceZone(e.target.value)} />
        <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(v) => setStatus(v as Crew['status'])} />

        <div>
          <p className="block text-sm font-medium text-slate-700 mb-1.5">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map((sp) => {
              const active = specialties.includes(sp.value);
              return (
                <button
                  key={sp.value}
                  type="button"
                  onClick={() => toggleSpecialty(sp.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    active
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-gray-200 text-slate-500 hover:border-gray-300'
                  }`}
                >
                  {sp.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={<Save className="w-4 h-4" />} onClick={handleSave} disabled={updateCrew.isPending}>
            {updateCrew.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// --- Edit Member Modal ---

function EditMemberModal({
  crewId,
  member,
  isOpen,
  onClose,
}: {
  crewId: string;
  member: Employee;
  isOpen: boolean;
  onClose: () => void;
}) {
  const updateCrewMember = useUpdateCrewMember();
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [phone, setPhone] = useState(member.phone);

  const handleSave = () => {
    updateCrewMember.mutate(
      { crewId, memberId: member.id, name, role: role as Employee['role'], phone },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Crew Member">
      <div className="space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(v) => setRole(v as Employee['role'])} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={<Save className="w-4 h-4" />} onClick={handleSave} disabled={updateCrewMember.isPending}>
            {updateCrewMember.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// --- Add Member Modal ---

function AddMemberModal({
  crewId,
  isOpen,
  onClose,
}: {
  crewId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const addCrewMember = useAddCrewMember();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Employee['role']>('technician');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addCrewMember.mutate(
      { crewId, name: name.trim(), role, phone: phone.trim() },
      {
        onSuccess: () => {
          setName('');
          setPhone('');
          setRole('technician');
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Crew Member">
      <div className="space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Smith" />
        <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(v) => setRole(v as Employee['role'])} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(330) 555-0000" />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleSave}
            disabled={!name.trim() || addCrewMember.isPending}
          >
            {addCrewMember.isPending ? 'Adding…' : 'Add Member'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// --- Add Crew Modal ---

const EQUIPMENT_TYPE_OPTIONS: { value: Equipment['type']; label: string }[] = [
  { value: 'zero-turn-mower', label: 'Zero-Turn Mower' },
  { value: 'stand-on-mower', label: 'Stand-On Mower' },
  { value: 'dump-trailer', label: 'Dump Trailer' },
  { value: 'skid-steer', label: 'Skid Steer' },
  { value: 'snow-plow', label: 'Snow Plow' },
  { value: 'leaf-blower', label: 'Leaf Blower' },
  { value: 'edger', label: 'Edger' },
  { value: 'trimmer', label: 'Trimmer' },
];

interface NewMemberDraft {
  id: string;
  name: string;
  role: Employee['role'];
  phone: string;
}

function AddCrewModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createCrew = useCreateCrew();
  const [name, setName] = useState('');
  const [serviceZone, setServiceZone] = useState('');
  const [specialties, setSpecialties] = useState<ServiceType[]>([]);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<Employee['role']>('crew-lead');
  const [memberPhone, setMemberPhone] = useState('');
  const [members, setMembers] = useState<NewMemberDraft[]>([]);

  const toggleSpecialty = (s: ServiceType) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `emp-${Date.now()}-${prev.length}`,
        name: memberName.trim(),
        role: memberRole,
        phone: memberPhone.trim(),
      },
    ]);
    setMemberName('');
    setMemberPhone('');
    setMemberRole('technician');
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    createCrew.mutate(
      {
        name: name.trim(),
        serviceZone: serviceZone.trim() || 'Unassigned',
        specialties,
        status: 'available',
        efficiency: 0,
        members: members.map((m) => ({
          name: m.name,
          role: m.role,
          phone: m.phone,
        })) as Crew['members'],
      },
      {
        onSuccess: () => {
          setName('');
          setServiceZone('');
          setSpecialties([]);
          setMembers([]);
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Crew" size="lg">
      <div className="space-y-4">
        <Input label="Crew Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alpha Crew" />
        <Input label="Service Zone" value={serviceZone} onChange={(e) => setServiceZone(e.target.value)} placeholder="e.g. North Canton / Green" />

        <div>
          <p className="block text-sm font-medium text-slate-700 mb-1.5">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map((sp) => {
              const active = specialties.includes(sp.value);
              return (
                <button
                  key={sp.value}
                  type="button"
                  onClick={() => toggleSpecialty(sp.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    active
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-gray-200 text-slate-500 hover:border-gray-300'
                  }`}
                >
                  {sp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline member builder */}
        <div>
          <p className="block text-sm font-medium text-slate-700 mb-1.5">Crew Members</p>
          {members.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {getInitials(m.name)}
                    </div>
                    <span className="text-slate-700">{m.name}</span>
                    <span className="text-xs text-slate-400">({m.role})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <Input label="" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Member name" />
            <Select options={ROLE_OPTIONS} value={memberRole} onChange={(v) => setMemberRole(v as Employee['role'])} />
            <Input label="" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} placeholder="Phone" />
            <Button variant="secondary" size="sm" onClick={handleAddMember} disabled={!memberName.trim()}>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleSave}
            disabled={!name.trim() || createCrew.isPending}
          >
            {createCrew.isPending ? 'Creating…' : 'Create Crew'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// --- Main Crews Page ---

export default function Crews() {
  const { data: crews = [], isLoading, isError } = useCrews();
  const removeCrewMember = useRemoveCrewMember();
  const deleteCrew = useDeleteCrew();

  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [editingMember, setEditingMember] = useState<{ crewId: string; member: Employee } | null>(null);
  const [addingMemberCrewId, setAddingMemberCrewId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ crewId: string; member: Employee } | null>(null);
  const [showAddCrew, setShowAddCrew] = useState(false);
  const [confirmDeleteCrew, setConfirmDeleteCrew] = useState<Crew | null>(null);

  const activeCrews = crews.filter((c) => c.status !== 'off-duty').length;
  const totalMembers = crews.reduce((s, c) => s + c.members.length, 0);
  const avgEfficiency = crews.length
    ? Math.round(crews.reduce((s, c) => s + c.efficiency, 0) / crews.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary + Add Crew button */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1">
          <StatsCard title="Total Crews" value={crews.length} />
          <StatsCard title="Active Now" value={activeCrews} />
          <StatsCard title="Team Members" value={totalMembers} />
          <StatsCard title="Avg Efficiency" value={`${avgEfficiency}%`} />
        </div>
        <div className="ml-4 shrink-0">
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddCrew(true)}>
            Add Crew
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingSpinner size="lg" label="Loading crews…" fullPage />}

      {/* Error state */}
      {!isLoading && isError && (
        <Card padding="lg">
          <EmptyState
            icon={<AlertCircle className="w-6 h-6" />}
            title="Couldn't load crews"
            description="Something went wrong while fetching crews. Please try again."
          />
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && crews.length === 0 && (
        <Card padding="lg">
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No crews yet"
            description="Create your first crew to start assigning jobs and team members."
            action="Add Crew"
            onAction={() => setShowAddCrew(true)}
          />
        </Card>
      )}

      {/* Crew Cards */}
      {!isLoading && !isError && crews.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {crews.map((crew) => {
            const statusBadge = getCrewStatusBadge(crew.status);
            return (
              <Card key={crew.id} padding="lg">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{crew.name}</h3>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Zone: {crew.serviceZone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingCrew(crew)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit crew"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteCrew(crew)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete crew"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{crew.todayJobsCompleted}/{crew.todayJobsCount}</p>
                      <p className="text-xs text-slate-400">jobs today</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Members</p>
                    <button
                      onClick={() => setAddingMemberCrewId(crew.id)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {crew.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {getInitials(m.name)}
                          </div>
                          <span className="text-slate-700">{m.name}</span>
                          <span className="text-xs text-slate-400">({m.role})</span>
                          {m.clockedIn && (
                            <span className="w-2 h-2 rounded-full bg-success" title="Clocked in" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="w-3 h-3" /> {m.phone}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingMember({ crewId: crew.id, member: m })}
                              className="p-1 rounded text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit member"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setConfirmRemove({ crewId: crew.id, member: m })}
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {crew.specialties.map((s) => {
                      const svcConfig = SERVICE_TYPES[s as ServiceType];
                      return (
                        <Badge key={s} variant="info">
                          {svcConfig?.label ?? s}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Equipment */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Equipment</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {crew.equipment.map((eq) => (
                      <div key={eq.id} className="flex items-center gap-1.5 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${eq.status === 'available' || eq.status === 'in-use' ? 'bg-success' : 'bg-warning'}`} />
                        <span className="text-slate-600">{eq.name}</span>
                        {eq.status === 'maintenance' && (
                          <span className="text-[10px] text-warning font-medium">(maint.)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance */}
                <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{crew.efficiency}%</p>
                      <p className="text-[10px] text-slate-400">efficiency</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{crew.todayJobsCompleted}</p>
                      <p className="text-[10px] text-slate-400">completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{crew.members.length}</p>
                      <p className="text-[10px] text-slate-400">members</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Crew Modal */}
      {showAddCrew && (
        <AddCrewModal
          isOpen={true}
          onClose={() => setShowAddCrew(false)}
        />
      )}

      {/* Edit Crew Modal */}
      {editingCrew && (
        <EditCrewModal
          crew={editingCrew}
          isOpen={true}
          onClose={() => setEditingCrew(null)}
        />
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          crewId={editingMember.crewId}
          member={editingMember.member}
          isOpen={true}
          onClose={() => setEditingMember(null)}
        />
      )}

      {/* Add Member Modal */}
      {addingMemberCrewId && (
        <AddMemberModal
          crewId={addingMemberCrewId}
          isOpen={true}
          onClose={() => setAddingMemberCrewId(null)}
        />
      )}

      {/* Remove Member Confirmation Modal */}
      {confirmRemove && (
        <Modal isOpen={true} onClose={() => setConfirmRemove(null)} title="Remove Member" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to remove <span className="font-semibold text-slate-900">{confirmRemove.member.name}</span> from this crew?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmRemove(null)}>Cancel</Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                disabled={removeCrewMember.isPending}
                onClick={() => {
                  removeCrewMember.mutate(
                    { crewId: confirmRemove.crewId, memberId: confirmRemove.member.id },
                    { onSuccess: () => setConfirmRemove(null) },
                  );
                }}
              >
                {removeCrewMember.isPending ? 'Removing…' : 'Remove'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Crew Confirmation Modal */}
      {confirmDeleteCrew && (
        <Modal isOpen={true} onClose={() => setConfirmDeleteCrew(null)} title="Delete Crew" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{confirmDeleteCrew.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmDeleteCrew(null)}>Cancel</Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                disabled={deleteCrew.isPending}
                onClick={() => {
                  deleteCrew.mutate(confirmDeleteCrew.id, {
                    onSuccess: () => setConfirmDeleteCrew(null),
                  });
                }}
              >
                {deleteCrew.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
