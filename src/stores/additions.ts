import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PersonInfo, PersonWorkInfo } from '@/views/interface'

export const useAdditionsStore = defineStore('additions', () => {
  const persons = ref<PersonInfo[]>([])
  const works = ref<PersonWorkInfo[]>([])

  function addPerson(person: PersonInfo) {
    persons.value.push(person)
  }

  function addWork(work: PersonWorkInfo) {
    works.value.push(work)
  }

  return { persons, works, addPerson, addWork }
})
