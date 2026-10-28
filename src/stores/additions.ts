import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PersonInfo, PersonWorkInfo, TaskInfo } from '@/views/interface'

export const useAdditionsStore = defineStore('additions', () => {
  const persons = ref<PersonInfo[]>([])
  const tasks = ref<TaskInfo[]>([])
  const works = ref<PersonWorkInfo[]>([])

  function addPerson(person: PersonInfo) {
    persons.value.push(person)
  }

  function addTask(task: TaskInfo) {
    tasks.value.push(task)
  }

  function addWork(work: PersonWorkInfo) {
    works.value.push(work)
  }

  return { persons, tasks, works, addPerson, addTask, addWork }
})
