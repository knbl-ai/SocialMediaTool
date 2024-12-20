import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const EditPostResponsive = ({ show, onClose }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex flex-col h-[90vh] w-full">
        {/* Main Content - Removed top padding since we removed the header */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
          {/* Left Column - 2/12 */}
          <div className="col-span-2 bg-gray-50 rounded-lg overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Left column content */}
            </div>
          </div>

          {/* Middle Column - 7/12 */}
          <div className="col-span-7 flex flex-col gap-4">
            {/* Top Section - Reduced height */}
            <div className="h-16 bg-gray-50 rounded-lg">
              {/* Top section content */}
            </div>

            {/* Middle Section - Adjusted height */}
            <div className="flex-[4] bg-gray-50 rounded-lg min-h-0">
              {/* Middle section content */}
            </div>

            {/* Bottom Section - Higher and full width */}
            <div className="h-32 w-full bg-gray-50 rounded-lg">
              {/* Bottom section content */}
            </div>
          </div>

          {/* Right Column - 3/12 */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Top Box - Aligned with red section, with close button */}
            <div className="h-16 bg-gray-50 rounded-lg flex justify-end items-center pr-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Bottom Box - Increased height */}
            <div className="flex-[3] bg-gray-50 rounded-lg min-h-0">
              {/* Bottom box content */}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EditPostResponsive
