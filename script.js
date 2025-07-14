// Script para controlar desbloqueo y aprobación de materias

// Variables para almacenar estado
const subjects = document.querySelectorAll('.subject');
const creditDisplay = document.getElementById('creditos-aprobados');

let approvedSubjects = new Set();
let totalCredits = 0;

// Función para verificar si un ramo está desbloqueado
function isUnlocked(subject) {
  if (subject.dataset.pre === 'none') return true;

  // Prerrequisito simple
  if (subject.dataset.pre.includes(',')) {
    // Múltiples prerrequisitos (no hay en la lista pero lo dejo preparado)
    const pres = subject.dataset.pre.split(',');
    return pres.every(p => approvedSubjects.has(p.trim()));
  } else {
    return approvedSubjects.has(subject.dataset.pre);
  }
}

// Función para actualizar el estado visual y desbloqueo
function updateSubjects() {
  subjects.forEach(subj => {
    if (approvedSubjects.has(subj.dataset.id)) {
      subj.classList.remove('locked', 'unlocked');
      subj.classList.add('approved');
      subj.disabled = true;
      subj.setAttribute('aria-pressed', 'true');
    } else if (isUnlocked(subj)) {
      subj.classList.remove('locked', 'approved');
      subj.classList.add('unlocked');
      subj.disabled = false;
      subj.setAttribute('aria-pressed', 'false');
    } else {
      subj.classList.remove('unlocked', 'approved');
      subj.classList.add('locked');
      subj.disabled = true;
      subj.setAttribute('aria-pressed', 'false');
    }
  });

  // Desbloqueo especial para PFG: solo si están aprobadas ciertas condiciones
  const pfg = document.querySelector('[data-id="pfg"]');
  if (pfg) {
    const fourthYearOnly = pfg.dataset.fourthYearOnly === 'true';
    if (fourthYearOnly) {
      // Requiere que sólo falte por aprobar "english" y materias 4to año
      const englishApproved = approvedSubjects.has('english');
      const approved4to = Array.from(approvedSubjects).filter(id =>
        ['proyt2','hormigonestr','patolrehab','planprog2','gestproc','valorperit','prevseg',
         'calidad','mantenimiento','legisurban','antisismica','pfg'].includes(id)
      );
      const remaining = Array.from(subjects)
        .map(s => s.dataset.id)
        .filter(id => !approvedSubjects.has(id) && id !== 'pfg');

      // Permitir si sólo quedan por aprobar "english" y asignaturas del 4º año
      const onlyEnglishAnd4to = remaining.every(id => id === 'english' || approved4to.includes(id));
      if (englishApproved && onlyEnglishAnd4to) {
        pfg.classList.remove('locked');
        pfg.classList.add('unlocked');
        pfg.disabled = false;
      } else {
        pfg.classList.remove('unlocked');
        pfg.classList.add('locked');
        pfg.disabled = true;
      }
    }
  }

  updateCredits();
}

// Función para actualizar créditos aprobados
function updateCredits() {
  totalCredits = 0;
  approvedSubjects.forEach(id => {
    const subj = document.querySelector(`[data-id="${id}"]`);
    if (subj) {
      totalCredits += parseInt(subj.dataset.credits, 10);
    }
  });
  creditDisplay.textContent = `Créditos aprobados: ${totalCredits}`;
}

// Función para manejar click en materias
function onSubjectClick(e) {
  const subj = e.currentTarget;
  if (subj.classList.contains('unlocked')) {
    const id = subj.dataset.id;

    if (approvedSubjects.has(id)) return; // Ya aprobada

    approvedSubjects.add(id);
    updateSubjects();
  }
}

// Inicialización
function init() {
  subjects.forEach(subj => {
    subj.addEventListener('click', onSubjectClick);
  });

  // Al cargar desbloquea materias sin prerrequisito
  updateSubjects();
}

document.addEventListener('DOMContentLoaded', init);
